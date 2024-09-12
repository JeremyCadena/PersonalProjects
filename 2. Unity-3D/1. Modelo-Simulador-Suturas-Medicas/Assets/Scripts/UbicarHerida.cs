using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class UbicarHerida : MonoBehaviour
{
    public Transform objectToRotate; // Objeto a rotar
    public float minRotationZ = -20f;
    public float maxRotationZ = 20f;
    public float minRotationY = -180f;
    public float maxRotationY = 180f;

    // Panel de fase a activar
    public GameObject phasePanel;

    void Update()
    {
        // Obtener la rotación actual
        float rotationZ = Mathf.Clamp(objectToRotate.localEulerAngles.z, minRotationZ, maxRotationZ);
        float rotationY = Mathf.Clamp(objectToRotate.localEulerAngles.y, minRotationY, maxRotationY);

        // Aplicar la rotación limitada
        objectToRotate.localEulerAngles = new Vector3(objectToRotate.localEulerAngles.x, rotationY, rotationZ);

        // Verificar si la rotación está dentro del rango específico
        if (IsInCorrectPosition(rotationY, rotationZ))
        {
            // Activar el panel de fase
            phasePanel.SetActive(true);
        }
    }

    bool IsInCorrectPosition(float rotationY, float rotationZ)
    {
        // Define los rangos de rotación específicos para activar el panel
        return (rotationZ > -10f && rotationZ < 10f) && (rotationY > -90f && rotationY < 90f);
    }
}