using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class EntrenamientoManager : MonoBehaviour
{
    public Collider baseCollider; // Collider de la base de la bandeja
    public TextMeshProUGUI panelText; // Texto del panel para mostrar el contador y el mensaje final
    public GameObject dialogo1Panel; // Primer panel de diálogo
    public GameObject dialogo2Panel; // Segundo panel de diálogo
    public GameObject teleportArea; // Teleport Area que se activará
    public GameObject completarFaseButton; // Botón para completar la fase y volver a la MainScene

    private int totalObjetosDentro = 0;
    private int totalObjetosRequeridos = 6; // Número de objetos que se requieren dentro de la bandeja
    private HashSet<GameObject> objetosDentro = new HashSet<GameObject>(); // Conjunto para rastrear los objetos dentro

    void Start()
    {
        // Inicializar el texto del panel y desactivar los paneles de diálogo, el área de teletransporte y el panel de usuario
        panelText.text = $"Objetos dentro: {totalObjetosDentro}/{totalObjetosRequeridos}";
        dialogo1Panel.SetActive(false);
        dialogo2Panel.SetActive(false);
        teleportArea.SetActive(false);
        completarFaseButton.SetActive(false);
    }

    void OnTriggerEnter(Collider other)
    {
        // Verificar si el objeto que entra en la bandeja es un objeto relevante 
        if (other != baseCollider && !objetosDentro.Contains(other.gameObject))
        {
            objetosDentro.Add(other.gameObject);
            totalObjetosDentro++;
            ActualizarPanel();
        }
    }

    void OnTriggerExit(Collider other)
    {
        // Verificar si un objeto relevante sale de la bandeja
        if (objetosDentro.Contains(other.gameObject))
        {
            objetosDentro.Remove(other.gameObject);
            totalObjetosDentro--;
            ActualizarPanel();
        }
    }

    void ActualizarPanel()
    {
        panelText.text = $"Objetos dentro: {totalObjetosDentro} de al menos {totalObjetosRequeridos}";

        // Activar los paneles de diálogo y el área de teletransporte si hay 6 o más objetos dentro
        if (totalObjetosDentro >= totalObjetosRequeridos)
        {
            panelText.text += "\n¡Felicidades por completar la fase! \nMira los nuevos paneles y continua para completar la fase";
            dialogo1Panel.SetActive(true);
            dialogo2Panel.SetActive(true);
            teleportArea.SetActive(true);
            StartCoroutine(ActivarBotonConRetraso());
        }
        else
        {
            dialogo1Panel.SetActive(false);
            dialogo2Panel.SetActive(false);
            teleportArea.SetActive(false);
            completarFaseButton.SetActive(false);
        }
    }

    IEnumerator ActivarBotonConRetraso()
    {
        // Esperar 30 segundos
        yield return new WaitForSeconds(5f);
        // Activar el botón de completar fase
        completarFaseButton.SetActive(true);
    }
}