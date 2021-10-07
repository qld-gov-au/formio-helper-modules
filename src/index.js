window.onload = function () {
  window.dataLayer = window.dataLayer || [];

  //widget config
  var config = {
    baseUrl: "https://api.forms.platforms.qld.gov.au",
    body_container: $("body"),
    formio_container: $("#formio"),
    defaultRedirect: "contact-us/response/",
    defaultMode: false,
    defaultType: "alert alert-warning",
    defaultTitle: "Maintenance",
    defaultMessage: "Description",
    defaultIcons: "fontawesome",
  };

  //Matrix widget values or default
  var form_metadata = {
      project_name: formio_config.project_name,
      form_name:
        formio_config.form_name + "/v/" + formio_config.form_revision ||
        formio_config.form_name,
      form_confirmation:
        formio_config.form_confirmation || config.defaultRedirect,
      maintenance_mode: formio_config.maintenance_mode || config.defaultMode,
      maintenance_type: formio_config.maintenance_type || config.defaultType,
      maintenance_title: formio_config.maintenance_title || config.defaultTitle,
      maintenance_message:
        formio_config.maintenance_message || config.defaultMessage,
      submitBtn: config.submitBtn || $("div#formio button.btn-primary"),
    }, //Use widget values or fallback
    formName, //GTM
    formModified; //GTM

  //Alerts
  var maintenance_alert =
    "<div id='formio_maintenance_alert' role='alert' class=" +
    form_metadata.maintenance_type +
    "><h2>" +
    form_metadata.maintenance_title +
    "</h2><p>" +
    form_metadata.maintenance_message +
    "</p></div>";

  //Init form
  Formio.icons = config.defaultIcons;
  Formio.use(premium);
  Formio.setBaseUrl(config.baseUrl);
  Formio.setProjectUrl(config.baseUrl + "/" + form_metadata.project_name);
  Formio.createForm(
    document.getElementById("formio"),
    config.baseUrl +
      "/" +
      form_metadata.project_name +
      "/" +
      form_metadata.form_name,
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
    }
  ).then(function (wizard) {
    window.form = wizard;
    formName = form._form.title;
    formModified = form._form.modified;

    //Check if maintenance mode is enabled - disable and replace banner
    if (form_metadata.maintenance_mode.toLowerCase() == "true") {
      form_metadata.maintenance_type.replace(/ /g, "%20");
      $(maintenance_alert).prependTo("#formio");
    }

    //Force new tab on formlinks
    config.body_container.on(
      "click",
      config.formio_container + " a",
      function (e) {
        e.target.target = "_blank";
      }
    );

    //Change event/GTM
    wizard.on("click", function (wizard, change) {
      var changeObj = change;
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
    wizard.on("applicationSubmit", function () {
      //Disable button
      $("#submitButton").attr("disabled", true);
      console.log("disabled");
      wizard
        .submit()
        .then(function () {
          if (form_metadata.form_confirmation) {
            window.location.href = "/" + form_metadata.form_confirmation;
          } else {
            //No confirmation set. Using generic redirection
            window.location.href = config.defaultRedirect;
          }
        })
        .catch(function () {
          console.debug(config.logError);
        });
    });
  });
};

//Persistant fix for iPhone/Safari
window.onpageshow = function (event) {
  if (event.persisted) {
    window.location.reload();
  }
};
