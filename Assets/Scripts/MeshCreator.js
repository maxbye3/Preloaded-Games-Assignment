var cardMats : Material[];
var size = Vector3(200, 30, 200);

var gray = true;
var width = 400;
var height = 400;
var lacunarity = 6.18;
var h = 0.69;
var octaves = 8.379;
var offset = 0.75;
var scale = 0.09;

var offsetPos = 0.0;

private var heightMap : Texture2D;
private var perlin : Perlin;
private var fractal : FractalNoise;
function Start ()
{
	heightMap = new Texture2D(width, height, TextureFormat.RGB24, false);
	Calculate();
	GenerateHeightmap();
}

function Calculate()
{
	if (perlin == null)
		perlin = new Perlin();
	fractal = new FractalNoise(h, lacunarity, octaves, perlin);
	
	for (var y = 0;y<height;y++)
	{
		for (var x = 0;x<width;x++)
		{
			if (gray)
			{
				var value = fractal.HybridMultifractal(x*scale, y * scale, offset);
				heightMap.SetPixel(x, y, Color (value, value, value, value));
			}
			else
			{
				offsetPos = Time.time;
				var valuex = fractal.HybridMultifractal(x*scale * 0.6, y*scale * 0.6, offset);
				var valuey = fractal.HybridMultifractal(x*scale + 161.7 * 0.2, y*scale + 161.7 * 0.3, offset);
				var valuez = fractal.HybridMultifractal(x*scale + 591.1, y*scale + 591.1 * 0.1, offset);
				heightMap.SetPixel(x, y, Color (valuex, valuey, valuez, 1));
			}
		}	
	}
	
	heightMap.Apply();
}


function GenerateHeightmap ()
{
	// Create the game object containing the renderer
	gameObject.AddComponent(MeshFilter);
	gameObject.AddComponent("MeshRenderer");
	
/*
if (material)
		renderer.material = material;
	else
		renderer.material.color = Color.white;
*/
  
    var mat = Random.Range(0, cardMats.length);
    renderer.material = cardMats[mat];
    
	// Retrieve a mesh instance
	var mesh : Mesh = GetComponent(MeshFilter).mesh;

	var width : int = Mathf.Min(heightMap.width, 255);
	var height : int = Mathf.Min(heightMap.height, 255);
	var y = 0;
	var x = 0;

	// Build vertices and UVs
	var vertices = new Vector3[height * width];
	var uv = new Vector2[height * width];
	var tangents = new Vector4[height * width];
	
	var uvScale = Vector2 (1.0 / (width - 1), 1.0 / (height - 1));
	var sizeScale = Vector3 (size.x / (width - 1), size.y, size.z / (height - 1));
	
	for (y=0;y<height;y++)
	{
		for (x=0;x<width;x++)
		{
			var pixelHeight = heightMap.GetPixel(x, y).grayscale;
			var vertex = Vector3 (x, pixelHeight, y);
			vertices[y*width + x] = Vector3.Scale(sizeScale, vertex);
			uv[y*width + x] = Vector2.Scale(Vector2 (x, y), uvScale);

			// Calculate tangent vector: a vector that goes from previous vertex
			// to next along X direction. We need tangents if we intend to
			// use bumpmap shaders on the mesh.
			var vertexL = Vector3( x-1, heightMap.GetPixel(x-1, y).grayscale, y );
			var vertexR = Vector3( x+1, heightMap.GetPixel(x+1, y).grayscale, y );
			var tan = Vector3.Scale( sizeScale, vertexR - vertexL ).normalized;
			tangents[y*width + x] = Vector4( tan.x, tan.y, tan.z, -1.0 );
		}
	}
	
	// Assign them to the mesh
	mesh.vertices = vertices;
	mesh.uv = uv;

	// Build triangle indices: 3 indices into vertex array for each triangle
	var triangles = new int[(height - 1) * (width - 1) * 6];
	var index = 0;
	for (y=0;y<height-1;y++)
	{
		for (x=0;x<width-1;x++)
		{
			// For each grid cell output two triangles
			triangles[index++] = (y     * width) + x;
			triangles[index++] = ((y+1) * width) + x;
			triangles[index++] = (y     * width) + x + 1;

			triangles[index++] = ((y+1) * width) + x;
			triangles[index++] = ((y+1) * width) + x + 1;
			triangles[index++] = (y     * width) + x + 1;
		}
	}
	// And assign them to the mesh
	mesh.triangles = triangles;
		
	// Auto-calculate vertex normals from the mesh
	mesh.RecalculateNormals();
	
	// Assign tangents after recalculating normals
	mesh.tangents = tangents;
	
	gameObject.AddComponent(MeshCollider);
}
