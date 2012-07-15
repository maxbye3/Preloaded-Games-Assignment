var Building : GameObject;
var pOneMinSpawn = 1;
var pOneMaxSpawn = 5;

private var clones = new Array ();
private var clone : GameObject;
private var Spawned = false;

function Update ()
{
if (!Spawned)
		{
			Spawn();
		}
}

function Spawn()
{
	Spawned = true;
	
	var mesh : Mesh = GetComponent(MeshFilter).mesh;
	var vertices = mesh.vertices;
	for (var i=0;i<vertices.length;i++)
	{
		var spawnPoint = transform.TransformPoint(vertices[i]);

		var q = Random.Range (0, vertices.length);
		spawnPoint = transform.TransformPoint(vertices[q]);

		pOneSpawn = Random.Range (pOneMinSpawn, pOneMaxSpawn);
		if (clones.length <= pOneSpawn)
//		if (clones.length <= 80)
		{
			clone = Instantiate (Building, spawnPoint, transform.rotation);
			clone.renderer.sharedMaterial.SetColor("_TintColor", Color.gray);
			clone.renderer.sharedMaterial.color.a = 0.5;
			clone.renderer.enabled = true;
			//clone.transform.rotation = Quaternion.FromToRotation(Vector3.down, (clone.transform.position - transform.position).normalized);
			clone.transform.rotation = Quaternion.FromToRotation (Vector3.down, transform.forward);
			clones.Push(clone);
		}
	}

	renderer.enabled = true;
}
