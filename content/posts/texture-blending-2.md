+++
title = 'Texture Blending 2(With Godot)'
date = 2023-12-23T23:53:15-05:00
draft = false
+++


This is a direct continuation of the previous post.

I created a plane mesh instance which I exported to Blender for subdividing and
UV coloring. We will be using the colors as weights for both blending and
layering.

![Image](/images/Mix_02_1.jpg)

I found Blender to be a bit troublesome for manipulating the colors of
individual vertices, perhaps I'll create a tool for the Godot editor in the
future to easily handle this.


On the edges will be 100% our R texture, and 100% our G texture in the middle.
Inbetween I added yellow vertices for a nice blend of an overlapping RG layer.


```glsl
shader_type spatial;
render_mode blend_mix,depth_draw_opaque,cull_back,diffuse_burley,specular_schlick_ggx;

// Macro to define a uniform group for a material layer.
// Each layer (R, G, B) will have its own set of uniforms for various material properties.
#define DEFINE_UNIFORM_GROUP(suffix) \
    group_uniforms Material##suffix; \
    uniform vec4 albedo##suffix : source_color = vec4(1.0); \
    uniform sampler2D texture_albedo##suffix : source_color,filter_linear_mipmap,repeat_enable; \
    uniform float roughness##suffix: hint_range(0,1) = 1.0; \
    uniform sampler2D texture_metallic##suffix: hint_default_white,filter_linear_mipmap,repeat_enable; \
    uniform vec4 metallic_texture_channel##suffix; \
    uniform sampler2D texture_roughness##suffix: hint_roughness_r,filter_linear_mipmap,repeat_enable; \
    uniform float specular##suffix = 0.5; \
    uniform float metallic##suffix = 0.0; \
    uniform sampler2D texture_normal##suffix: hint_normal,filter_linear_mipmap,repeat_enable; \
    uniform float normal_scale##suffix: hint_range(-16,16) = 1.0; \
    uniform sampler2D texture_ambient_occlusion##suffix: hint_default_white, filter_linear_mipmap,repeat_enable; \
    uniform vec4 ao_texture_channel##suffix = vec4(1.0, 0.0, 0.0, 0.0); \
    uniform float ao_light_affect##suffix = 0.0; \
    uniform sampler2D texture_heightmap##suffix: hint_default_black,filter_linear_mipmap,repeat_enable; \
    uniform float heightmap_scale##suffix = 5.0; \
    uniform vec2 heightmap_flip##suffix; \
    group_uniforms;

// Define uniforms for three material layers: R, G, and B.
DEFINE_UNIFORM_GROUP(R)
DEFINE_UNIFORM_GROUP(G)
//DEFINE_UNIFORM_GROUP(B)


uniform vec3 uv1_scale = vec3(1.0);
uniform vec3 uv1_offset;
uniform vec3 uv2_scale = vec3(1.0);
uniform vec3 uv2_offset;

// Uniform to control the sharpness of the blend.
uniform float BlendSharpness: hint_range(1.0,10.0) = 3.0;
uniform sampler2D texture_noise;


void vertex() {
	UV=UV*uv1_scale.xy+uv1_offset.xy;
}

struct MaterialProperties {
	vec4 albedo;
	float roughness;
	vec4 metallic_texture_channel;
	float specular;
	float metallic;
	float normal_scale;
	vec4 ao_texture_channel;
	float ao_light_affect;
	float heightmap_scale;
	vec2 heightmap_flip;

	vec2 uv;
	vec3 vertex;
	vec3 normal;
	vec3 tangent;
	vec3 binormal;
};

struct ProcessMaterialOut {
	vec3 albedo;
	float metallic;
	float roughness;
	float specular;
	vec3 normal_map;
	float normal_map_depth;
	float ao;
	float ao_light_affect;
	float depth;
	float height;
};

// Function to process material properties and textures for a layer.
// Applies texture sampling and calculations to derive final material attributes.
ProcessMaterialOut process_material(MaterialProperties props, sampler2D texture_albedo, sampler2D texture_heightmap,
	sampler2D texture_metallic, sampler2D texture_roughness, sampler2D texture_normal,
	sampler2D texture_ambient_occlusion) {
	ProcessMaterialOut p_out;
	vec2 base_uv;
	{
		vec3 view_dir = normalize(normalize(-props.vertex) * mat3(props.tangent * props.heightmap_flip.x, -props.binormal * props.heightmap_flip.y, props.normal));
		float height = texture(texture_heightmap, props.uv).r;
		float depth = 1.0 - height;
		p_out.depth = depth;
		p_out.height = height;
		vec2 ofs = props.uv - view_dir.xy * depth * props.heightmap_scale * 0.01;
		base_uv=ofs;
	}

	vec4 albedo_tex = texture(texture_albedo,base_uv);
	p_out.albedo = props.albedo.rgb * albedo_tex.rgb;
	float metallic_tex = dot(texture(texture_metallic,base_uv), props.metallic_texture_channel);
	p_out.metallic = metallic_tex * props.metallic;
	vec4 roughness_texture_channel = vec4(1.0,0.0,0.0,0.0);
	float roughness_tex = dot(texture(texture_roughness,base_uv),roughness_texture_channel);
	p_out.roughness = roughness_tex * props.roughness;
	p_out.specular = props.specular;
	p_out.normal_map = texture(texture_normal,base_uv).rgb;
	p_out.normal_map_depth = props.normal_scale;
	p_out.ao = dot(texture(texture_ambient_occlusion,base_uv),props.ao_texture_channel);
	p_out.ao_light_affect = props.ao_light_affect;

	return p_out;
}

// Utility function to reconstruct the Z component of a normal vector from its X and Y components.
float reconstructZ(vec3 norm) {
    return sqrt(max(0.0, 1.0 - dot(norm.xy, norm.xy)));
}

// Macro to initialize material properties for a layer based on the defined uniforms.
#define DEFINE_MATERIAL_PROPERTIES(suffix) \
    MaterialProperties mat##suffix; \
    mat##suffix.albedo = albedo##suffix; \
    mat##suffix.roughness = roughness##suffix; \
    mat##suffix.metallic_texture_channel = metallic_texture_channel##suffix; \
    mat##suffix.specular = specular##suffix; \
    mat##suffix.metallic = metallic##suffix; \
    mat##suffix.normal_scale = normal_scale##suffix; \
    mat##suffix.ao_texture_channel = ao_texture_channel##suffix; \
    mat##suffix.ao_light_affect = ao_light_affect##suffix; \
    mat##suffix.heightmap_scale = heightmap_scale##suffix; \
    mat##suffix.heightmap_flip = heightmap_flip##suffix; \
    \
    mat##suffix.uv = UV; \
    mat##suffix.vertex = VERTEX; \
    mat##suffix.normal = NORMAL; \
    mat##suffix.tangent = TANGENT; \
    mat##suffix.binormal = BINORMAL; \
    \
    out##suffix = process_material(mat##suffix, texture_albedo##suffix, texture_heightmap##suffix, texture_metallic##suffix, \
    texture_roughness##suffix, texture_normal##suffix, texture_ambient_occlusion##suffix);


void fragment() {
	// Output structures for each layer (R, G, B) after processing their material properties.
	ProcessMaterialOut outR;
	ProcessMaterialOut outG;
	//ProcessMaterialOut outB;

	// Initialize material properties for each layer.
	{
		DEFINE_MATERIAL_PROPERTIES(R)
		DEFINE_MATERIAL_PROPERTIES(G)
	//	DEFINE_MATERIAL_PROPERTIES(B)
	}

	// Ensure that vertex colors are non-negative.
	vec3 vcolor = max(COLOR.rgb, vec3(0.0));

	// Calculate blending weights for each layer.
	// These weights are based on the red, green, and the minimum of red and green components of the vertex color.
	float weightR = vcolor.r;
	float weightG = vcolor.g;
	float weightRG = min(weightR, weightG);

	float adjWeightR = pow(max(weightR - weightRG, 0.0), BlendSharpness);
	float adjWeightG = pow(max(weightG - weightRG, 0.0), BlendSharpness);
	float adjWeightRG = pow(weightRG, BlendSharpness);

	float totalWeight = adjWeightR + adjWeightG + adjWeightRG;

	// Normalize the weights so they sum up to 1.
	float normWeightR = adjWeightR / totalWeight;
	float normWeightG = adjWeightG / totalWeight;
	float normWeightRG = adjWeightRG / totalWeight;

	// Determine the step function for layer height comparison.
	// This is used to create a sharp transition between layers based on their height.
	float stepRG = step(outR.height, outG.height);

	// Blend the albedo, roughness, specular, normal map, and other properties from each layer.
	// The blending is based on the normalized weights and the height-based step function.
	// Each property is blended separately.
	vec3 layerColorR = outR.albedo * normWeightR;
	vec3 layerColorG = outG.albedo * normWeightG;
	vec3 layerColorRG = mix(outR.albedo, outG.albedo, stepRG) * normWeightRG;

	float layerRoughnessR = outR.roughness * normWeightR;
	float layerRoughnessG = outG.roughness * normWeightG;
	float layerRoughnessRG = mix(outR.roughness, outG.roughness, stepRG) * normWeightRG;

	float layerSpecularR = outR.specular * normWeightR;
	float layerSpecularG = outG.specular * normWeightG;
	float layerSpecularRG = mix(outR.specular, outG.specular, stepRG) * normWeightRG;

	// Normal map blending is handled with care to preserve correct surface details.
	vec3 layerNormalR = outR.normal_map ;
	layerNormalR.z = reconstructZ(layerNormalR);
	layerNormalR *= normWeightR;

	vec3 layerNormalG = outG.normal_map;
	layerNormalG.z = reconstructZ(layerNormalG);
	layerNormalG *= normWeightG;

	// This is correct, the step creates a sharp transition, no lerp happens.
	vec3 layerNormalRG = mix(outR.normal_map, outG.normal_map, stepRG);
	layerNormalRG.z = reconstructZ(layerNormalRG);
	layerNormalRG *= normWeightRG;

	// Blend the normal map depth, ambient occlusion, and AO light affect from each layer.
	float layerNormalDepthR = outR.normal_map_depth * normWeightR;
	float layerNormalDepthG = outG.normal_map_depth * normWeightG;
	float layerNormalDepthRG = mix(outR.normal_map_depth, outG.normal_map_depth, stepRG) * normWeightRG;

	float layerAoR = outR.ao * normWeightR;
	float layerAoG = outG.ao * normWeightG;
	float layerAoRG = mix(outR.ao, outG.ao, stepRG) * normWeightRG;

	float layerAoLightR = outR.ao_light_affect * normWeightR;
	float layerAoLightG = outG.ao_light_affect * normWeightG;
	float layerAoLightRG = mix(outR.ao_light_affect, outG.ao_light_affect, stepRG) * normWeightRG;

	// Final composition of the material properties.
	// The properties from each layer are added together based on their respective weights.
	ALBEDO = layerColorR + layerColorG + layerColorRG;
	ROUGHNESS = layerRoughnessR + layerRoughnessG + layerRoughnessRG;
	SPECULAR = layerSpecularR + layerSpecularG + layerSpecularRG;
	NORMAL_MAP = normalize(layerNormalR + layerNormalG + layerNormalRG);
	NORMAL_MAP_DEPTH = layerNormalDepthR + layerNormalDepthG + layerNormalDepthRG;
	AO = layerAoR + layerAoG + layerAoRG;
	AO_LIGHT_AFFECT = layerAoLightR + layerAoLightG + layerAoLightRG;
}
```

That's a lot of code, but don't be intimidated. It's from the Standard Material
3D shader with the properties we want. The calculations were extracted to a
function, and we use preprocessor macros to generate our layer code.

This could be extended to blending between three sub-materials, but it would go
from 3 possible combinations to 7. That's a lot of operations.


Our final output:
![Image](/images/Mix_02_2.jpg)

We can see where the yellow vertices are is a nice overlapping layer of dirt and
stone which creates a pleasant layer to blend between the two.

The code we're most interested in is after:
```glsl
	// Initialize material properties for each layer.
	{
		DEFINE_MATERIAL_PROPERTIES(R)
		DEFINE_MATERIAL_PROPERTIES(G)
	}
```

The sub-materials are applied based on weighting for R, G, and RG. Recall that
RG is our R+G height-based layered sub-material.


This code *may* be unfamiliar:
```glsl
float stepRG = step(outR.height, outG.height);
[…]
mix(outR.roughness, outG.roughness, stepRG)
```

It's just an optimization to skip conditionals. stepRG is always 0.0 or 1.0,
therefore we're always getting 100% of outR's value or outG's value based on the
value in the height maps at our fragment's location.


We use a sharpness parameter to control the sharpness of the blends between
sub-materials:
```glsl
float adjWeightR = pow(max(weightR - weightRG, 0.0), BlendSharpness);
float adjWeightG = pow(max(weightG - weightRG, 0.0), BlendSharpness);
float adjWeightRG = pow(weightRG, BlendSharpness);
```


Sharpness value of 1.0:
![Image](/images/Mix_02_Sharpness1.jpg)

Sharpness value of 3.0:
![Image](/images/Mix_02_Sharpness3.jpg)


To be able to properly weight & normalize our normal vectors, we have to
reconstruct the Z parameter. Normal maps pack R&G(x, y) together.
After reconstruction, we nlerp between them based on their respective vertex
color weights. This probably doesn't look too good if there's a significant
angle difference, but as this is for ground materials I'll probably be OK.

```glsl
vec3 layerNormalR = outR.normal_map ;
layerNormalR.z = reconstructZ(layerNormalR);
layerNormalR *= normWeightR;

vec3 layerNormalG = outG.normal_map;
layerNormalG.z = reconstructZ(layerNormalG);
layerNormalG *= normWeightG;

vec3 layerNormalRG = mix(outR.normal_map, outG.normal_map, stepRG);
layerNormalRG.z = reconstructZ(layerNormalRG);
layerNormalRG *= normWeightRG;
[…]
NORMAL_MAP = normalize(layerNormalR + layerNormalG + layerNormalRG);
```
