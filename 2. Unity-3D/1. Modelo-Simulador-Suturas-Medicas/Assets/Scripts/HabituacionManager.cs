using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using TMPro;

public class HabituacionManager : MonoBehaviour
{
    public Collider baseCollider; // Collider de la base de la bandeja
    public TextMeshProUGUI panelText; // Texto del panel para mostrar el contador y el mensaje final
    public GameObject completarFaseButton; // Botón para completar la fase y volver a la MainScene

    private int totalObjetosDentro = 0;
    private int totalObjetosRequeridos = 2; // Número de objetos que se requieren dentro de la bandeja
    private HashSet<GameObject> objetosDentro = new HashSet<GameObject>(); // Conjunto para rastrear los objetos dentro

    void Start()
    {
        // Inicializar el texto del panel y desactivar el botón
        panelText.text = $"Objetos dentro: {totalObjetosDentro}/{totalObjetosRequeridos}";
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
        panelText.text = $"Objetos dentro: {totalObjetosDentro}/{totalObjetosRequeridos}";

        if (totalObjetosDentro == totalObjetosRequeridos)
        {
            panelText.text += "\n¡Felicidades por completar la fase!";
            completarFaseButton.SetActive(true);
        }
        else
        {
            completarFaseButton.SetActive(false);
        }
    }
}
