package main

import (
	"context"
	"encoding/csv"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"

	"compozit-vision/internal/domain/entities"
	"compozit-vision/internal/domain/repositories"
	"compozit-vision/internal/infrastructure/furniture"
	"compozit-vision/pkg/logger"
)

type ImportConfig struct {
	DatabaseURL    string
	InputFile      string
	Format         string // csv, json
	ValidateOnly   bool
	BatchSize      int
	DryRun         bool
	VendorID       string
	CategoryMap    string // JSON file for category mapping
	BrandMap       string // JSON file for brand mapping
}

type FurnitureImporter struct {
	config       ImportConfig
	db           *sqlx.DB
	repo         repositories.FurnitureImportRepository
	categoryMap  map[string]uuid.UUID
	brandMap     map[string]uuid.UUID
	logger       logger.Logger
}

func main() {
	config := parseFlags()
	
	// Initialize logger
	log := logger.New("furniture-import")
	
	// Connect to database
	db, err := sqlx.Connect("postgres", config.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database", "error", err)
	}
	defer db.Close()
	
	// Create importer
	importer := NewFurnitureImporter(config, db, log)
	
	// Load mappings
	if err := importer.loadMappings(); err != nil {
		log.Fatal("Failed to load mappings", "error", err)
	}
	
	// Execute import
	ctx := context.Background()
	if err := importer.Import(ctx); err != nil {
		log.Fatal("Import failed", "error", err)
	}
	
	log.Info("Import completed successfully")
}

func parseFlags() ImportConfig {
	config := ImportConfig{}
	
	flag.StringVar(&config.DatabaseURL, "db", "", "Database connection URL")
	flag.StringVar(&config.InputFile, "input", "", "Input file path")
	flag.StringVar(&config.Format, "format", "csv", "Input format (csv, json)")
	flag.BoolVar(&config.ValidateOnly, "validate", false, "Only validate, don't import")
	flag.IntVar(&config.BatchSize, "batch-size", 100, "Import batch size")
	flag.BoolVar(&config.DryRun, "dry-run", false, "Perform dry run without actual import")
	flag.StringVar(&config.VendorID, "vendor", "", "Vendor ID for imported items")
	flag.StringVar(&config.CategoryMap, "category-map", "", "Category mapping file")
	flag.StringVar(&config.BrandMap, "brand-map", "", "Brand mapping file")
	
	flag.Parse()
	
	if config.DatabaseURL == "" {
		config.DatabaseURL = os.Getenv("DATABASE_URL")
	}
	
	if config.InputFile == "" {
		flag.Usage()
		os.Exit(1)
	}
	
	return config
}

func NewFurnitureImporter(config ImportConfig, db *sqlx.DB, logger logger.Logger) *FurnitureImporter {
	// Create import repository
	repo := furniture.NewFurnitureImportRepository(db)
	
	return &FurnitureImporter{
		config:      config,
		db:          db,
		repo:        repo,
		categoryMap: make(map[string]uuid.UUID),
		brandMap:    make(map[string]uuid.UUID),
		logger:      logger,
	}
}

func (fi *FurnitureImporter) loadMappings() error {
	// Load category mappings
	if fi.config.CategoryMap != "" {
		if err := fi.loadCategoryMappings(); err != nil {
			return fmt.Errorf("failed to load category mappings: %w", err)
		}
	}
	
	// Load brand mappings
	if fi.config.BrandMap != "" {
		if err := fi.loadBrandMappings(); err != nil {
			return fmt.Errorf("failed to load brand mappings: %w", err)
		}
	}
	
	return nil
}

func (fi *FurnitureImporter) loadCategoryMappings() error {
	file, err := os.Open(fi.config.CategoryMap)
	if err != nil {
		return err
	}
	defer file.Close()
	
	var mappings map[string]string
	if err := json.NewDecoder(file).Decode(&mappings); err != nil {
		return err
	}
	
	for name, idStr := range mappings {
		id, err := uuid.Parse(idStr)
		if err != nil {
			return fmt.Errorf("invalid UUID for category %s: %w", name, err)
		}
		fi.categoryMap[name] = id
	}
	
	return nil
}

func (fi *FurnitureImporter) loadBrandMappings() error {
	file, err := os.Open(fi.config.BrandMap)
	if err != nil {
		return err
	}
	defer file.Close()
	
	var mappings map[string]string
	if err := json.NewDecoder(file).Decode(&mappings); err != nil {
		return err
	}
	
	for name, idStr := range mappings {
		id, err := uuid.Parse(idStr)
		if err != nil {
			return fmt.Errorf("invalid UUID for brand %s: %w", name, err)
		}
		fi.brandMap[name] = id
	}
	
	return nil
}

func (fi *FurnitureImporter) Import(ctx context.Context) error {
	// Read and parse input file
	data, err := fi.readInputFile()
	if err != nil {
		return fmt.Errorf("failed to read input file: %w", err)
	}
	
	fi.logger.Info("Loaded furniture data", "count", len(data))
	
	// Validate data
	validation, err := fi.repo.ValidateImportData(ctx, data)
	if err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}
	
	if !validation.IsValid {
		fi.logger.Error("Data validation failed", "errors", validation.ErrorCount)
		fi.printValidationErrors(validation)
		
		if fi.config.ValidateOnly {
			return fmt.Errorf("validation failed with %d errors", validation.ErrorCount)
		}
	}
	
	if validation.Warnings != nil && len(validation.Warnings) > 0 {
		fi.logger.Warn("Data validation warnings", "warnings", len(validation.Warnings))
		fi.printValidationWarnings(validation)
	}
	
	// Return if only validating
	if fi.config.ValidateOnly {
		fi.logger.Info("Validation completed successfully")
		return nil
	}
	
	// Return if dry run
	if fi.config.DryRun {
		fi.logger.Info("Dry run completed - no data imported")
		return nil
	}
	
	// Perform import
	result, err := fi.repo.ImportFurnitureData(ctx, data)
	if err != nil {
		return fmt.Errorf("import failed: %w", err)
	}
	
	fi.printImportResults(result)
	
	return nil
}

func (fi *FurnitureImporter) readInputFile() ([]repositories.ImportFurnitureItem, error) {
	switch fi.config.Format {
	case "csv":
		return fi.readCSVFile()
	case "json":
		return fi.readJSONFile()
	default:
		return nil, fmt.Errorf("unsupported format: %s", fi.config.Format)
	}
}

func (fi *FurnitureImporter) readJSONFile() ([]repositories.ImportFurnitureItem, error) {
	file, err := os.Open(fi.config.InputFile)
	if err != nil {
		return nil, err
	}
	defer file.Close()
	
	var data []repositories.ImportFurnitureItem
	if err := json.NewDecoder(file).Decode(&data); err != nil {
		return nil, err
	}
	
	return data, nil
}

func (fi *FurnitureImporter) readCSVFile() ([]repositories.ImportFurnitureItem, error) {
	file, err := os.Open(fi.config.InputFile)
	if err != nil {
		return nil, err
	}
	defer file.Close()
	
	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}
	
	if len(records) == 0 {
		return nil, fmt.Errorf("empty CSV file")
	}
	
	// Parse header
	headers := records[0]
	headerMap := make(map[string]int)
	for i, header := range headers {
		headerMap[strings.TrimSpace(header)] = i
	}
	
	// Validate required columns
	requiredColumns := []string{"name", "brand_name", "category_path", "price", "length", "width", "height"}
	for _, col := range requiredColumns {
		if _, exists := headerMap[col]; !exists {
			return nil, fmt.Errorf("missing required column: %s", col)
		}
	}
	
	// Parse records
	data := make([]repositories.ImportFurnitureItem, 0, len(records)-1)
	for i := 1; i < len(records); i++ {
		record := records[i]
		
		item, err := fi.parseCSVRecord(record, headerMap, i+1)
		if err != nil {
			fi.logger.Warn("Skipping invalid record", "row", i+1, "error", err)
			continue
		}
		
		data = append(data, *item)
	}
	
	return data, nil
}

func (fi *FurnitureImporter) parseCSVRecord(record []string, headerMap map[string]int, row int) (*repositories.ImportFurnitureItem, error) {
	item := &repositories.ImportFurnitureItem{}
	
	// Parse required fields
	item.Name = strings.TrimSpace(record[headerMap["name"]])
	if item.Name == "" {
		return nil, fmt.Errorf("empty name")
	}
	
	item.BrandName = strings.TrimSpace(record[headerMap["brand_name"]])
	if item.BrandName == "" {
		return nil, fmt.Errorf("empty brand name")
	}
	
	// Parse category path
	categoryPathStr := strings.TrimSpace(record[headerMap["category_path"]])
	if categoryPathStr != "" {
		item.CategoryPath = strings.Split(categoryPathStr, " > ")
	}
	
	// Parse price
	priceStr := strings.TrimSpace(record[headerMap["price"]])
	if priceStr != "" {
		price, err := strconv.ParseFloat(strings.TrimPrefix(priceStr, "$"), 64)
		if err != nil {
			return nil, fmt.Errorf("invalid price: %s", priceStr)
		}
		item.Price = price
	}
	
	// Parse dimensions
	lengthStr := strings.TrimSpace(record[headerMap["length"]])
	if lengthStr != "" {
		length, err := strconv.ParseFloat(lengthStr, 64)
		if err != nil {
			return nil, fmt.Errorf("invalid length: %s", lengthStr)
		}
		item.Length = length
	}
	
	widthStr := strings.TrimSpace(record[headerMap["width"]])
	if widthStr != "" {
		width, err := strconv.ParseFloat(widthStr, 64)
		if err != nil {
			return nil, fmt.Errorf("invalid width: %s", widthStr)
		}
		item.Width = width
	}
	
	heightStr := strings.TrimSpace(record[headerMap["height"]])
	if heightStr != "" {
		height, err := strconv.ParseFloat(heightStr, 64)
		if err != nil {
			return nil, fmt.Errorf("invalid height: %s", heightStr)
		}
		item.Height = height
	}
	
	// Parse optional fields
	if idx, exists := headerMap["sku"]; exists && idx < len(record) {
		if sku := strings.TrimSpace(record[idx]); sku != "" {
			item.SKU = &sku
		}
	}
	
	if idx, exists := headerMap["description"]; exists && idx < len(record) {
		if desc := strings.TrimSpace(record[idx]); desc != "" {
			item.Description = &desc
		}
	}
	
	// Parse tags (comma-separated)
	if idx, exists := headerMap["style_tags"]; exists && idx < len(record) {
		if tags := strings.TrimSpace(record[idx]); tags != "" {
			item.StyleTags = strings.Split(tags, ",")
			for i, tag := range item.StyleTags {
				item.StyleTags[i] = strings.TrimSpace(tag)
			}
		}
	}
	
	if idx, exists := headerMap["color_tags"]; exists && idx < len(record) {
		if tags := strings.TrimSpace(record[idx]); tags != "" {
			item.ColorTags = strings.Split(tags, ",")
			for i, tag := range item.ColorTags {
				item.ColorTags[i] = strings.TrimSpace(tag)
			}
		}
	}
	
	if idx, exists := headerMap["material_tags"]; exists && idx < len(record) {
		if tags := strings.TrimSpace(record[idx]); tags != "" {
			item.MaterialTags = strings.Split(tags, ",")
			for i, tag := range item.MaterialTags {
				item.MaterialTags[i] = strings.TrimSpace(tag)
			}
		}
	}
	
	// Parse stock and availability
	if idx, exists := headerMap["stock_quantity"]; exists && idx < len(record) {
		if stockStr := strings.TrimSpace(record[idx]); stockStr != "" {
			stock, err := strconv.Atoi(stockStr)
			if err == nil {
				item.StockQuantity = stock
			}
		}
	}
	
	if idx, exists := headerMap["availability_status"]; exists && idx < len(record) {
		if status := strings.TrimSpace(record[idx]); status != "" {
			item.AvailabilityStatus = status
		}
	} else {
		item.AvailabilityStatus = "available"
	}
	
	// Set currency default
	item.Currency = "USD"
	
	// Set vendor info if provided
	if fi.config.VendorID != "" {
		item.VendorID = &fi.config.VendorID
	}
	
	return item, nil
}

func (fi *FurnitureImporter) printValidationErrors(validation *repositories.ValidationResult) {
	fmt.Println("\n=== Validation Errors ===")
	for _, err := range validation.Errors {
		fmt.Printf("Row %d, Field %s: %s (Value: %s)\n", err.Row, err.Field, err.Message, err.Value)
	}
}

func (fi *FurnitureImporter) printValidationWarnings(validation *repositories.ValidationResult) {
	fmt.Println("\n=== Validation Warnings ===")
	for _, warning := range validation.Warnings {
		fmt.Printf("Row %d, Field %s: %s (Value: %s)\n", warning.Row, warning.Field, warning.Message, warning.Value)
	}
}

func (fi *FurnitureImporter) printImportResults(result *repositories.ImportResult) {
	fmt.Printf("\n=== Import Results ===\n")
	fmt.Printf("Total Processed: %d\n", result.TotalProcessed)
	fmt.Printf("Successfully Imported: %d\n", result.SuccessCount)
	fmt.Printf("Errors: %d\n", result.ErrorCount)
	fmt.Printf("Created Items: %d\n", len(result.CreatedItems))
	fmt.Printf("Updated Items: %d\n", len(result.UpdatedItems))
	fmt.Printf("Skipped Items: %d\n", len(result.SkippedItems))
	
	if result.ErrorCount > 0 {
		fmt.Println("\n=== Import Errors ===")
		for _, err := range result.Errors {
			fmt.Printf("Row %d, Field %s: %s (Value: %s)\n", err.Row, err.Field, err.Message, err.Value)
		}
	}
	
	if len(result.Warnings) > 0 {
		fmt.Println("\n=== Import Warnings ===")
		for _, warning := range result.Warnings {
			fmt.Printf("Row %d, Field %s: %s (Value: %s)\n", warning.Row, warning.Field, warning.Message, warning.Value)
		}
	}
}