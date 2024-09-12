using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class FinishFaseOne : MonoBehaviour
{
    public Button exitButton; // Referencia al botón de salir

    void Start()
    {
        // Agregar un listener al botón de salir
        exitButton.onClick.AddListener(ExitToMainScene);
    }

    // Método que se llama al hacer clic en el botón de salir
    void ExitToMainScene()
    {
        // Cargar la escena principal
        SceneManager.LoadScene("TransitionScene");
    }
}