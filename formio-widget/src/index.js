window.onload = function () {
  window.dataLayer = window.dataLayer || [];

  //Widget config (should not change):
  const body_container = $("body");
  const defaultRedirect = "contact-us/response/";
  const defaultIcons = "fontawesome";

  //Init form
  Formio.icons = defaultIcons;
  Formio.use(premium);
    
  // polyfill plugin function to fix the namespace option doesn't pass to Formio.makeRequest
  var NamespacePolyfillPlugin = {
    priority: 0,
    preRequest: function(requestArgs) {
        if (requestArgs.formio && formioInstances) {
            const formioInstance = formioInstances.find((item)=>item.formio.formUrl===requestArgs.formio.formUrl);
            requestArgs.formio = formioInstance.formio;
            requestArgs.opts.formio = formioInstance.formio;
            console.log("test777", requestArgs)
        }
        if (requestArgs.formio.options) requestArgs.opts.namespace = requestArgs.formio.options.namespace
      return Promise.resolve(null);
    },
  }  
  Formio.registerPlugin(NamespacePolyfillPlugin, 'namespacepolyfill');

  if (formioInstances && formioInstances.length) {
      formioInstances.forEach(function(formioInstance) {
          console.log("test111", formioInstance);
          /*
          * setup config
          */
          const baseUrl = "https://" + formioInstance.env_url.trim();
          // const formio_container_id = "formio";
          const formio_container_id = "formio-"+formioInstance.asset_id;
          const submitBtn = $("#"+formio_container_id+" button[name='data[submit]']");
          let form_name = "";
          //Check if value is truthly/exists and is numeric
          if (formioInstance.form_revision && $.isNumeric(formioInstance.form_revision)) {
              form_name = formioInstance.form_name + "/v/" + formioInstance.form_revision;
          } else {
              console.log("Revision fallsback for "+formio_container_id);
              form_name = formioInstance.form_name;
          }
          const project_name = formioInstance.project_name;
          const form_confirmation = formioInstance.form_confirmation || defaultRedirect;
          const namespace = formioInstance.namespace || ("formio-" + project_name);
          
          
          /*
          * init formio instance
          */
          const formio = new Formio(
              baseUrl + "/" + project_name + "/" + form_name, 
              {
                  base: baseUrl,
                  project: baseUrl + "/" + project_name,
                  namespace: namespace,
              }
          );
          console.log("Test333", formio);
          formioInstance.formio = formio;
          
          
          
          /*
          * load formio form
          */
          Formio.createForm(
              document.getElementById(formio_container_id), 
              baseUrl + "/" + project_name + "/" + form_name, 
              // form,
              {
                  //Turn off default buttons
                  buttonSettings: {
                      showCancel: false,
                      showPrevious: false,
                      showNext: false,
                      showSubmit: false,
                  },
                  i18n: {
                      en: { pattern: "Must use the format shown" },
                  },
                  formio: formio,
                  namespace: formio.options.namespace,
              }
          ).then(function (wizard) {
              wizard.formio = formio;
              wizard.options.formio = formio;
              console.log("test555", wizard);
              
              const formName = wizard._form.title;
              const formModified = wizard._form.modified;
              
              //Force new tab on formlinks
              body_container.on(
                  "click",
                  "#" + formio_container_id + " a",
                  function (e) {
                      e.target.target = "_blank";
                  }
              );
          
              //Change event/GTM
              wizard.on("click", function (change) {
                  var changeObj = change;
                  console.log("test777", changeObj)
                  if (
                  typeof changeObj.changed != "undefined" &&
                  typeof changeObj.changed.component != "undefined"
                  ) {
                      dataLayer.push({
                        event: "formio-interaction",
                        "formio-name": formName,
                        "formio-input-id": changeObj.changed.component.id,
                        "formio-input-type": changeObj.changed.component.type,
                        "formio-input-value": changeObj.changed.component.value,
                        "formio-input-key": changeObj.changed.component.key,
                        "formio-input-label-raw": changeObj.changed.component.label,
                        "formio-version": formModified,
                        "formio-category": "Form: " + formName,
                        "formio-action": "Value changed",
                      });
                  }
              });
          
              //Must use 'applicationSubmit' custom event on primary submit
              wizard.on("applicationSubmit", function (data) {
                  submitBtn.attr("disabled", true);
                  wizard
                  .submit()
                  .then(function () {
                    if (form_confirmation) {
                      window.location.href = "/" + form_confirmation;
                    } else {
                      //No confirmation set. Using generic redirection
                      window.location.href = defaultRedirect;
                    }
                  })
                  .catch(function () {
                    console.debug("Submission error");
                  });
              });
          })
      });
  }
};

//Persistant fix for iPhone/Safari
window.onpageshow = function (event) {
if (event.persisted) {
  window.location.reload();
}
};
