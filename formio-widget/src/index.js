window.onload = function () {
  window.dataLayer = window.dataLayer || [];

  //Widget config (should not change):
  var config = {
      baseUrl: "https://" + formio_config.env_url.trim(),
      body_container: $("body"),
      formio_container: "#formio",
      defaultRedirect: "contact-us/response/",
      defaultIcons: "fontawesome",
      submitBtn: $("button[name='data[submit]']"),
    }, //Matrix widget values or default:
    form_metadata = {
      form_name: "",
      project_name: formio_config.project_name,
      form_confirmation:
        formio_config.form_confirmation || config.defaultRedirect,
    }, //Use widget values or fallback
    formName, //GTM values
    formModified; //GTM values

  //Check if value is truthly/exists and is numeric
  formio_config.form_revision && $.isNumeric(formio_config.form_revision)
    ? (form_metadata.form_name =
        formio_config.form_name + "/v/" + formio_config.form_revision)
    : (form_metadata.form_name = formio_config.form_name);

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

    //Force new tab on formlinks
    config.body_container.on(
      "click",
      config.formio_container + " a",
      function (e) {
        e.target.target = "_blank";
      }
    );

    //Change event/GTM
    wizard.on("click", function (change) {
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
    wizard.on("applicationSubmit", function (data) {
      config.submitBtn.attr("disabled", true);
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
          console.debug("Submission error");
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
