using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using EzySlice;
using Oculus.Interaction.HandGrab;
using Oculus.Interaction;
using Unity.VisualScripting;

public class SlicedObject : MonoBehaviour
{
    public Transform startSlicedPoint;
    public Transform endSlicedPoint;
    public VelocityEstimator velocityEstimator;
    public LayerMask sliceableLayer;

    public float cutForce = 10;

    // Update is called once per frame
    void FixedUpdate()
    {
        bool hasHit = Physics.Linecast(startSlicedPoint.position, endSlicedPoint.position, out RaycastHit hit, sliceableLayer);
        if (hasHit)
        {
            GameObject target = hit.transform.gameObject;
            Slice(target);
        }
    }

    public void Slice(GameObject target)
    {
        Vector3 velocity = velocityEstimator.GetVelocityEstimate();
        Vector3 planeNormal = Vector3.Cross(endSlicedPoint.position - startSlicedPoint.position, velocity);
        planeNormal.Normalize();

        SlicedHull hull = target.Slice(endSlicedPoint.position, planeNormal);

        if (hull != null)
        {
            GameObject upperHull = hull.CreateUpperHull(target, target.GetComponent<Renderer>().material);
            SetupSlicedComponent(upperHull);

            GameObject lowerHull = hull.CreateLowerHull(target, target.GetComponent<Renderer>().material);
            SetupSlicedComponent(lowerHull);

            Destroy(target);
        }
    }

    public void SetupSlicedComponent(GameObject slicedObject)
    {
        if (slicedObject != null)
        {
            // Agregar Rigidbody y MeshCollider
            Rigidbody rb = slicedObject.AddComponent<Rigidbody>();
            BoxCollider collider = slicedObject.AddComponent<BoxCollider>();

            // Fijar el tamaño del collider en el eje X a 2, y permitir que Y y Z se adapten automáticamente
            Vector3 colliderSize = collider.size;
            collider.size = new Vector3(3f, colliderSize.y, 3f);

            // Aplicar la fuerza para dispersar las partes cortadas
            //rb.AddExplosionForce(cutForce, slicedObject.transform.position, 1);

            // Permitir que la nueva parte sea cortada
            //slicedObject.layer = LayerMask.NameToLayer("Sliceable");

            // Agregar los scripts de Meta para interactividad
            //Grabbable grabbable = slicedObject.AddComponent<Grabbable>();
            //HandGrabInteractable handGrab = slicedObject.AddComponent<HandGrabInteractable>();
            //slicedObject.AddComponent<GrabInteractable>();

        }
    }
}