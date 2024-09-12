using UnityEngine;
using UnityEngine.SceneManagement;
using System.Collections;

public class SceneTransition : MonoBehaviour
{
    private float transitionTimer = 0f; // Temporizador para la transici�n
    private const float transitionDelay = 30f; // Tiempo en segundos para esperar en la escena de transici�n

    void Start()
    {
        // Iniciar el temporizador para la transici�n
        transitionTimer = 0f;
    }

    void Update()
    {
        // Incrementar el temporizador
        transitionTimer += Time.deltaTime;

        // Verificar si ha pasado el tiempo de espera
        if (transitionTimer >= transitionDelay)
        {
            // Cargar la escena principal despu�s del tiempo de espera
            SceneManager.LoadScene("MainScene");
        }
    }
}