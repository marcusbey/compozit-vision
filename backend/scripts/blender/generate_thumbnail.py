#!/usr/bin/env python3
"""
Blender Python script to generate thumbnails from 3D models
Creates high-quality preview images for web/mobile display
"""

import bpy
import bmesh
import sys
import argparse
import mathutils
from pathlib import Path

def clear_scene():
    """Remove all objects from the scene except camera and light"""
    # Select all mesh objects
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            obj.select_set(True)
    
    # Delete selected objects
    bpy.ops.object.delete()

def import_model(model_path):
    """Import 3D model file"""
    print(f"Importing model: {model_path}")
    
    file_ext = Path(model_path).suffix.lower()
    
    try:
        if file_ext == '.glb':
            bpy.ops.import_scene.gltf(filepath=model_path)
        elif file_ext == '.gltf':
            bpy.ops.import_scene.gltf(filepath=model_path)
        elif file_ext == '.obj':
            bpy.ops.import_scene.obj(filepath=model_path)
        elif file_ext == '.fbx':
            bpy.ops.import_scene.fbx(filepath=model_path)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
        
        print("Model imported successfully")
        
    except Exception as e:
        print(f"Error importing model: {e}")
        raise

def setup_lighting():
    """Setup three-point lighting for thumbnail"""
    
    # Remove existing lights
    bpy.ops.object.select_all(action='DESELECT')
    for obj in bpy.context.scene.objects:
        if obj.type == 'LIGHT':
            obj.select_set(True)
    bpy.ops.object.delete()
    
    # Key light (main light)
    bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
    key_light = bpy.context.active_object
    key_light.name = "Key_Light"
    key_light.data.energy = 3
    key_light.rotation_euler = (0.785, 0, 0.785)
    
    # Fill light (softer, opposite side)
    bpy.ops.object.light_add(type='AREA', location=(-3, -3, 5))
    fill_light = bpy.context.active_object
    fill_light.name = "Fill_Light"
    fill_light.data.energy = 1
    fill_light.data.size = 5
    fill_light.rotation_euler = (1.2, 0, -0.785)
    
    # Rim light (back lighting)
    bpy.ops.object.light_add(type='SPOT', location=(0, -10, 8))
    rim_light = bpy.context.active_object
    rim_light.name = "Rim_Light"
    rim_light.data.energy = 2
    rim_light.data.spot_size = 1.2
    rim_light.rotation_euler = (1.4, 0, 0)
    
    print("Three-point lighting setup completed")

def setup_camera(target_object=None):
    """Setup camera for optimal thumbnail view"""
    
    # Remove existing camera
    if 'Camera' in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects['Camera'], do_unlink=True)
    
    # Add new camera
    bpy.ops.object.camera_add()
    camera = bpy.context.active_object
    camera.name = "Thumbnail_Camera"
    
    if target_object:
        # Position camera to frame the object nicely
        # Get object bounding box
        bbox_corners = [target_object.matrix_world @ mathutils.Vector(corner) for corner in target_object.bound_box]
        
        # Calculate center and size
        min_coords = [min(corner[i] for corner in bbox_corners) for i in range(3)]
        max_coords = [max(corner[i] for corner in bbox_corners) for i in range(3)]
        
        center = mathutils.Vector([(min_coords[i] + max_coords[i]) / 2 for i in range(3)])
        size = max(max_coords[i] - min_coords[i] for i in range(3))
        
        # Position camera at an angle
        distance = size * 2.5  # Adjust multiplier for framing
        camera.location = center + mathutils.Vector((distance * 0.7, -distance * 0.7, distance * 0.5))
        
        # Point camera at center
        direction = center - camera.location
        camera.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
        
    else:
        # Default camera position
        camera.location = (4, -4, 3)
        camera.rotation_euler = (1.1, 0, 0.785)
    
    # Set as active camera
    bpy.context.scene.camera = camera
    
    # Adjust camera settings for better thumbnail
    camera.data.lens = 50  # 50mm lens for natural look
    camera.data.clip_end = 1000  # Extend far clipping plane
    
    print(f"Camera positioned at: {camera.location}")
    return camera

def setup_materials():
    """Setup materials for better thumbnail appearance"""
    
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH' and obj.data.materials:
            for i, mat_slot in enumerate(obj.material_slots):
                if mat_slot.material:
                    mat = mat_slot.material
                    
                    # Enable nodes if not already
                    if not mat.use_nodes:
                        mat.use_nodes = True
                    
                    nodes = mat.node_tree.nodes
                    
                    # Find Principled BSDF
                    principled = None
                    for node in nodes:
                        if node.type == 'BSDF_PRINCIPLED':
                            principled = node
                            break
                    
                    if principled:
                        # Adjust material for better appearance
                        # Slightly increase metallic for more interesting reflections
                        if principled.inputs['Metallic'].default_value < 0.1:
                            principled.inputs['Metallic'].default_value = 0.1
                        
                        # Adjust roughness for better lighting
                        if principled.inputs['Roughness'].default_value > 0.8:
                            principled.inputs['Roughness'].default_value = 0.6

def setup_world():
    """Setup world environment for thumbnail"""
    world = bpy.context.scene.world
    world.use_nodes = True
    
    nodes = world.node_tree.nodes
    links = world.node_tree.links
    
    # Clear existing nodes
    nodes.clear()
    
    # Add environment texture
    env_tex = nodes.new(type='ShaderNodeTexEnvironment')
    env_tex.location = 0, 0
    
    # Add background shader
    background = nodes.new(type='ShaderNodeBackground')
    background.location = 200, 0
    background.inputs['Strength'].default_value = 0.3  # Subtle environment lighting
    
    # Add output
    output = nodes.new(type='ShaderNodeOutputWorld')
    output.location = 400, 0
    
    # Link nodes
    links.new(background.outputs['Background'], output.inputs['Surface'])
    
    # Set a light grey background color
    background.inputs['Color'].default_value = (0.9, 0.9, 0.9, 1.0)

def render_thumbnail(output_path, width=512, height=512):
    """Render the thumbnail image"""
    
    # Set render settings
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'  # Use Cycles for quality
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.film_transparent = True  # Transparent background
    
    # Cycles settings for quality vs speed balance
    scene.cycles.samples = 128  # Good quality but reasonable render time
    scene.cycles.max_bounces = 8
    scene.cycles.diffuse_bounces = 4
    scene.cycles.glossy_bounces = 4
    scene.cycles.transmission_bounces = 2
    
    # Use GPU if available
    scene.cycles.device = 'GPU'
    
    # Denoising for cleaner result
    scene.cycles.use_denoising = True
    
    print(f"Rendering thumbnail at {width}x{height}")
    
    # Render the image
    bpy.ops.render.render(write_still=True)
    
    # Save the image
    bpy.data.images['Render Result'].save_render(filepath=output_path)
    
    print(f"Thumbnail saved to: {output_path}")

def get_largest_object():
    """Get the largest mesh object in the scene for camera targeting"""
    largest_obj = None
    largest_size = 0
    
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            # Calculate object size
            bbox = obj.bound_box
            size = max(bbox[4][i] - bbox[0][i] for i in range(3))
            
            if size > largest_size:
                largest_size = size
                largest_obj = obj
    
    return largest_obj

def main():
    """Main thumbnail generation function"""
    parser = argparse.ArgumentParser(description='Generate thumbnail from 3D model')
    parser.add_argument('--model', required=True, help='Path to 3D model file')
    parser.add_argument('--output', required=True, help='Output thumbnail path')
    parser.add_argument('--width', type=int, default=512, help='Thumbnail width')
    parser.add_argument('--height', type=int, default=512, help='Thumbnail height')
    
    # Parse arguments (skip Blender's arguments)
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
    
    try:
        print("Starting thumbnail generation")
        
        # Clear the scene
        clear_scene()
        
        # Import the model
        import_model(args.model)
        
        # Get the largest object for camera targeting
        target_obj = get_largest_object()
        
        # Setup lighting
        setup_lighting()
        
        # Setup camera
        setup_camera(target_obj)
        
        # Setup materials
        setup_materials()
        
        # Setup world environment
        setup_world()
        
        # Render thumbnail
        render_thumbnail(args.output, args.width, args.height)
        
        print("Thumbnail generation completed successfully")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()