#!/usr/bin/env python3
"""
Blender Python script to generate 3D room scenes
Handles room geometry, furniture placement, lighting, and materials
"""

import bpy
import bmesh
import json
import sys
import argparse
import mathutils
from pathlib import Path

def clear_scene():
    """Remove all objects from the scene"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def create_room_geometry(room_data):
    """Create room geometry from data"""
    print(f"Creating room geometry: {room_data['dimensions']}")
    
    # Create room mesh
    mesh = bpy.data.meshes.new('Room')
    obj = bpy.data.objects.new('Room', mesh)
    bpy.context.collection.objects.link(obj)
    
    # Create bmesh for easier mesh manipulation
    bm = bmesh.new()
    
    # Room dimensions
    dims = room_data['dimensions']
    length = dims['length']
    width = dims['width']
    height = dims['height']
    
    # Create room box (inside faces visible)
    bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=(length, height, width), verts=bm.verts)
    
    # Flip normals to face inward
    for face in bm.faces:
        face.normal_flip()
    
    # Create openings for doors and windows
    if 'features' in room_data:
        for feature in room_data['features']:
            if feature['type'] in ['door', 'window']:
                create_opening(bm, feature)
    
    # Update mesh
    bm.to_mesh(mesh)
    bm.free()
    
    return obj

def create_opening(bm, feature):
    """Create door/window opening in wall"""
    # Simplified opening creation - would need more complex geometry operations
    print(f"Creating {feature['type']} opening")
    pass

def place_furniture(furniture_data):
    """Place furniture objects in the scene"""
    furniture_objects = []
    
    for furniture in furniture_data:
        print(f"Placing furniture: {furniture['name']}")
        
        # Create simple furniture placeholder (cube)
        # In production, would load actual 3D models
        bpy.ops.mesh.primitive_cube_add()
        obj = bpy.context.active_object
        obj.name = f"Furniture_{furniture['id']}"
        
        # Apply transformations
        obj.location = furniture['position']
        obj.rotation_euler = furniture['rotation']
        obj.scale = furniture['scale']
        
        # Apply materials if available
        if 'material' in furniture:
            apply_material(obj, furniture['material'])
        
        furniture_objects.append(obj)
    
    return furniture_objects

def setup_lighting(lights_data):
    """Setup scene lighting"""
    light_objects = []
    
    # Remove default light
    if 'Light' in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects['Light'], do_unlink=True)
    
    for light_data in lights_data:
        print(f"Creating {light_data['type']} light")
        
        # Create light based on type
        if light_data['type'] == 'point':
            bpy.ops.object.light_add(type='POINT')
        elif light_data['type'] == 'directional':
            bpy.ops.object.light_add(type='SUN')
        elif light_data['type'] == 'spot':
            bpy.ops.object.light_add(type='SPOT')
        elif light_data['type'] == 'area':
            bpy.ops.object.light_add(type='AREA')
        
        light_obj = bpy.context.active_object
        light_obj.name = f"Light_{light_data['id']}"
        light_obj.location = light_data['position']
        
        # Set light properties
        light = light_obj.data
        light.energy = light_data['intensity'] * 100  # Blender light energy scaling
        
        # Set color (simplified)
        if 'color' in light_data:
            # Convert hex color to RGB (simplified)
            light.color = (1.0, 1.0, 1.0)  # White for now
        
        light_objects.append(light_obj)
    
    return light_objects

def apply_materials(materials_data, objects):
    """Apply materials to objects"""
    for material_data in materials_data:
        print(f"Creating material: {material_data['name']}")
        
        # Create material
        mat = bpy.data.materials.new(name=material_data['name'])
        mat.use_nodes = True
        
        # Get the material nodes
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        
        # Clear existing nodes
        nodes.clear()
        
        # Create Principled BSDF node
        bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
        bsdf.location = 0, 0
        
        # Create Material Output node
        output = nodes.new(type='ShaderNodeOutputMaterial')
        output.location = 400, 0
        
        # Link BSDF to output
        links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
        
        # Set material properties
        if 'color' in material_data:
            # Convert hex to RGB (simplified)
            bsdf.inputs['Base Color'].default_value = (0.8, 0.8, 0.8, 1.0)
        
        if 'metalness' in material_data:
            bsdf.inputs['Metallic'].default_value = material_data['metalness']
        
        if 'roughness' in material_data:
            bsdf.inputs['Roughness'].default_value = material_data['roughness']
        
        # Add texture if available
        if 'texture' in material_data and material_data['texture']:
            create_texture_node(mat, material_data['texture'])

def create_texture_node(material, texture_path):
    """Add texture node to material"""
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    
    # Create Image Texture node
    tex_image = nodes.new('ShaderNodeTexImage')
    tex_image.location = -300, 0
    
    # Load image (if file exists)
    try:
        img = bpy.data.images.load(texture_path)
        tex_image.image = img
    except:
        print(f"Warning: Could not load texture {texture_path}")
    
    # Connect to BSDF
    bsdf = nodes.get('Principled BSDF')
    if bsdf:
        links.new(tex_image.outputs['Color'], bsdf.inputs['Base Color'])

def setup_camera():
    """Setup camera for room view"""
    # Remove default camera
    if 'Camera' in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects['Camera'], do_unlink=True)
    
    # Add new camera
    bpy.ops.object.camera_add()
    camera = bpy.context.active_object
    camera.location = (3, -3, 2)
    camera.rotation_euler = (1.1, 0, 0.785)
    
    # Set as active camera
    bpy.context.scene.camera = camera
    
    return camera

def export_scene(output_path):
    """Export scene as GLB file"""
    print(f"Exporting scene to: {output_path}")
    
    # Select all objects
    bpy.ops.object.select_all(action='SELECT')
    
    # Export as GLB
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        export_selected=True,
        export_materials='EXPORT',
        export_textures=True,
        export_cameras=True,
        export_lights=True
    )
    
    print("Export completed successfully")

def main():
    """Main function to generate the scene"""
    parser = argparse.ArgumentParser(description='Generate 3D room scene in Blender')
    parser.add_argument('--scene_data', required=True, help='Path to scene data JSON file')
    parser.add_argument('--output', required=True, help='Output GLB file path')
    
    # Parse arguments (skip Blender's own arguments)
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
    
    try:
        # Load scene data
        print(f"Loading scene data from: {args.scene_data}")
        with open(args.scene_data, 'r') as f:
            scene_data = json.load(f)
        
        print("Clearing existing scene")
        clear_scene()
        
        # Create room geometry
        if 'room' in scene_data:
            room_obj = create_room_geometry(scene_data['room'])
        
        # Place furniture
        if 'furniture' in scene_data:
            furniture_objects = place_furniture(scene_data['furniture'])
        
        # Setup lighting
        if 'lights' in scene_data:
            light_objects = setup_lighting(scene_data['lights'])
        
        # Apply materials
        if 'materials' in scene_data:
            all_objects = [room_obj] + furniture_objects if 'room' in scene_data and 'furniture' in scene_data else []
            apply_materials(scene_data['materials'], all_objects)
        
        # Setup camera
        camera = setup_camera()
        
        # Export scene
        export_scene(args.output)
        
        print("Scene generation completed successfully")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()