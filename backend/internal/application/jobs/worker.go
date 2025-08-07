package jobs

import (
	"context"
	"time"

	"github.com/compozit/vision/backend/pkg/logger"
)

// Worker processes jobs from the queue
type Worker struct {
	id         int
	jobChannel <-chan *Job
	queue      *Queue
	logger     logger.Logger
	quit       chan bool
}

// NewWorker creates a new worker
func NewWorker(id int, jobChannel <-chan *Job, queue *Queue, logger logger.Logger) *Worker {
	return &Worker{
		id:         id,
		jobChannel: jobChannel,
		queue:      queue,
		logger:     logger,
		quit:       make(chan bool),
	}
}

// Start begins processing jobs
func (w *Worker) Start(ctx context.Context) {
	w.logger.Info("Worker started", "worker_id", w.id)

	for {
		select {
		case job := <-w.jobChannel:
			if job == nil {
				w.logger.Info("Job channel closed, stopping worker", "worker_id", w.id)
				return
			}
			w.processJob(ctx, job)

		case <-w.quit:
			w.logger.Info("Worker stopping", "worker_id", w.id)
			return

		case <-ctx.Done():
			w.logger.Info("Context cancelled, stopping worker", "worker_id", w.id)
			return
		}
	}
}

// Stop gracefully stops the worker
func (w *Worker) Stop() {
	w.logger.Info("Stopping worker", "worker_id", w.id)
	w.quit <- true
}

// processJob processes a single job with retry logic
func (w *Worker) processJob(ctx context.Context, job *Job) {
	w.logger.Info("Worker processing job", 
		"worker_id", w.id, 
		"job_id", job.ID, 
		"job_type", job.Type)

	// Check if job was cancelled
	if job.Status == JobStatusCancelled {
		w.logger.Info("Job was cancelled, skipping", "job_id", job.ID)
		return
	}

	// Process the job
	err := w.queue.ProcessJob(ctx, job)
	
	if err != nil {
		w.logger.Error("Job processing failed", 
			"worker_id", w.id,
			"job_id", job.ID, 
			"error", err,
			"retry_count", job.RetryCount)

		// Handle retry logic
		if job.RetryCount < job.MaxRetries {
			w.retryJob(job, err)
		} else {
			w.failJob(job, err)
		}
	} else {
		w.logger.Info("Job completed successfully", 
			"worker_id", w.id,
			"job_id", job.ID)
	}
}

// retryJob schedules a job for retry after a delay
func (w *Worker) retryJob(job *Job, err error) {
	job.RetryCount++
	
	// Exponential backoff: 2^retry_count seconds
	delay := time.Duration(1<<job.RetryCount) * time.Second
	
	w.logger.Info("Scheduling job retry", 
		"job_id", job.ID,
		"retry_count", job.RetryCount,
		"delay", delay)

	// Schedule retry after delay
	go func() {
		time.Sleep(delay)
		
		// Reset job status for retry
		job.Status = JobStatusQueued
		job.Progress = 0
		
		// Add back to queue
		select {
		case w.queue.jobChannel <- job:
			w.logger.Info("Job requeued for retry", "job_id", job.ID)
		default:
			w.logger.Error("Failed to requeue job - queue full", "job_id", job.ID)
			w.failJob(job, err)
		}
	}()
}

// failJob marks a job as permanently failed
func (w *Worker) failJob(job *Job, err error) {
	w.logger.Error("Job permanently failed after retries", 
		"job_id", job.ID,
		"retry_count", job.RetryCount,
		"error", err)

	w.queue.UpdateJob(job.ID, JobStatusFailed, job.Progress, nil, err)
}