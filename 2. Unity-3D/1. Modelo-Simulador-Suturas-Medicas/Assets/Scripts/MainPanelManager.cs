using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class MainPanelManager : MonoBehaviour
{
    // Referencias a los paneles y toggles
    public GameObject mainPanel, endPanel;
    public Button habituacionButton, entrenamientoButton, pruebasButton;
    public Button exitButton;
    public Button exitBackButton, endButton;

    void Start()
    {
        // Asignar las funciones a cada toggle
        habituacionButton.onClick.AddListener(delegate { ChangeScene("HabituacionScene"); });
        entrenamientoButton.onClick.AddListener(delegate { ChangeScene("EntrenamientoScene"); });
        pruebasButton.onClick.AddListener(delegate { ChangeScene("PruebasScene"); });
        exitButton.onClick.AddListener(delegate { ShowEndPanel(); });

        // Listeners para regresar al panel principal
        exitBackButton.onClick.AddListener(delegate { ReturnToMainPanel(); });

        // Listener para finalizar la aplicación
        endButton.onClick.AddListener(delegate { ExitApplication(); });

    }

    void ChangeScene(string sceneName)
    {
        if (mainPanel.activeSelf)
        {
            SceneManager.LoadScene(sceneName);
        }
    }

    void ShowEndPanel()
    {
        mainPanel.SetActive(false);
        endPanel.SetActive(true);
    }

    void ReturnToMainPanel()
    {
        if (endPanel.activeSelf)
        {
            endPanel.SetActive(false);
        }

        mainPanel.SetActive(true);
    }

    void ExitApplication()
    {
        // Cerrar la aplicación
#if UNITY_EDITOR
        Debug.Log("Salir de la aplicación (solo funciona en la compilación)");
#else
        Application.Quit();
#endif
    }
}