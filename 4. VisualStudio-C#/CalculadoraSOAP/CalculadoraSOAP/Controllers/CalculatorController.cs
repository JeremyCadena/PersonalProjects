using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Threading.Tasks;

namespace CalculadoraSOAP.Controllers
{
    public class CalculatorController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<ActionResult> Index(int intA, int intB, string operation)
        {
            int result = 0;

            switch (operation)
            {
                case "Add":
                    result = await new CalculadoraSOAP.ServiceCalculadoraSOAP.CalculatorSoapClient().AddAsync(intA, intB);
                    break;
                case "Subtract":
                    result = await new CalculadoraSOAP.ServiceCalculadoraSOAP.CalculatorSoapClient().SubtractAsync(intA, intB);
                    break;
                case "Multiply":
                    result = await new CalculadoraSOAP.ServiceCalculadoraSOAP.CalculatorSoapClient().MultiplyAsync(intA, intB);
                    break;
                case "Divide":
                    result = await new CalculadoraSOAP.ServiceCalculadoraSOAP.CalculatorSoapClient().DivideAsync(intA, intB);
                    break;
                default:
                    ModelState.AddModelError(string.Empty, "Operación no válida");
                    break;
            }

            ViewBag.Resultado = result;
            return View();
        }
    }

}