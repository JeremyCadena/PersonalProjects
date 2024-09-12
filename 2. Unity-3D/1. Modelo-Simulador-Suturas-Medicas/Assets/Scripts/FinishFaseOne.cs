using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class FinishFaseOne : MonoBehaviour
{
    public Button exitButton; // Referencia al bot�n de salir

    void Start()
    {
        // Agregar un listener al bot�n de salir
        exitButton.onClick.AddListener(ExitToMainScene);
    }

    // M�todo que se llama al hacer clic en el bot�n de salir
    void ExitToMainScene()
    {
        // Cargar la escena principal
        SceneManager.LoadScene("TransitionScene");
    }
}