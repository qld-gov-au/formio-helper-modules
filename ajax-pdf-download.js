var qgFormsIoSettings = {
    config : {
        baseUrl: "https://" + formio_config.env_url.trim(),
        body_container: $("body"),
        formio_container: "#formio",
        defaultRedirect: "contact-us/response/",
        defaultIcons: "fontawesome",
        submitBtn: $("button[name='data[submit]']"),
    },
    init: function (){
        this.onDownloadPdfBtnClick();
    },
    form_metadata : {
        form_name: "",
        project_name: formio_config.project_name,
        form_confirmation:
            formio_config.form_confirmation || config.defaultRedirect,
    },
    /**
     * isPdfDownloadEnabled function open matching accordion if it finds #title-Of-Accordion in the url
     * function trims down the hash value, and then it matches with the titles of the accordion, and if there is a matching title, then it open that panel
     * @return {undefined}
     **/
    isPdfDownloadEnabled: function (submissionData){
        if(submissionData) {
            // check PDF download option is checked and PDF exist on forms.io for a particular form
            if(formio_config.pdf_download &&
                submissionData &&
                submissionData.metadata &&
                submissionData.metadata.PostToAPIGateway &&
                submissionData.metadata.PostToAPIGateway.DownloadUrl){
                return submissionData.metadata.PostToAPIGateway.DownloadUrl;
            }
        }
    },
    /**
     * submitLoaderIcon function open matching accordion if it finds #title-Of-Accordion in the url
     * function trims down the hash value, and then it matches with the titles of the accordion, and if there is a matching title, then it open that panel
     * @return {undefined}
     **/
    submitLoaderIcon: function (){
        $("#download-pdf").attr("disabled", true).append('<i class="fa fa-circle-o-notch fa-spin ml-1"></i>');
    },
    /**
     * submitLoaderIcon function open matching accordion if it finds #title-Of-Accordion in the url
     * function trims down the hash value, and then it matches with the titles of the accordion, and if there is a matching title, then it open that panel
     * @return {undefined}
     **/
    feedbackMessageTemplate: function () {
        return `<div class="qg-formsio__thank-you-message alert alert-success mt-4" role="alert">
            <h2><i class="fa fa-check-circle"></i>Thank you for your feedback</h2>
            <p><strong>Please note:</strong> It may take approximately 10 business days to receive a response.</p>
            <p>If your enquiry is urgent, please contact us by phone:</p>
            <ul><li>For COVID-19 enquiries, please visit <a href="http://www.covid19.qld.gov.au" target="_blank" rel="nofollow noopener" title="Opens in new window">www.covid19.qld.gov.au <span class="qg-blank-notice sr-only">(Opens in new window)</span> </a> or call 134 COVID (13 42 68).</li><li>For all other general enquiries, call 13 QGOV (13 74 68).</li></ul>
            <p>If you have included your email, we will acknowledge your enquiry and send it to the appropriate Queensland Government department.</p>
            <p>The Queensland Government is committed to protecting <a href="https://www.qld.gov.au/legal/privacy" target="_blank" rel="nofollow noopener" title="Opens in new window">your privacy <span class="qg-blank-notice sr-only">(Opens in new window)</span> </a>.</p>
            ${sessionStorage.getItem('pdfUrl') ? `<button class="btn btn-primary" id="download-pdf">Download a PDF copy of your enquiry</button>` : ''}
       </div>`
    },
    onDownloadPdfBtnClick: function (){
        var self = this;
        if(sessionStorage.getItem('pdfUrl')){
            $('body').on('click', '#download-pdf', function(event) {
                self.submitLoaderIcon()
                window.location.href = sessionStorage.getItem('pdfUrl');
            });
        }
    },
    onWizardSubmit: function (wizard){
        wizard.on("submit", function (submissionData) {
            if(qgFormsIoSettings.isPdfDownloadEnabled(submissionData)){
                sessionStorage.setItem("pdfUrl", submissionData.metadata.PostToAPIGateway.DownloadUrl);
            }
            $('.formio_container').html(qgFormsIoSettings.feedbackMessageTemplate());
            $([document.documentElement, document.body]).animate({
                scrollTop: $("#formio").offset().top
            }, 0);
        });
    },
    onWizardChange: function (wizard, formName, formModified){
        //Change event/GTM
        wizard.on("change", function (change) {
            let changeObj = change;
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
    }
}
qgFormsIoSettings.init();


window.onload = function () {
    window.dataLayer = window.dataLayer || [];

    //Widget config (should not change):
    var formName, //GTM values
        formModified; //GTM values

    //Check if value is truthly/exists and is numeric
    formio_config.form_revision && $.isNumeric(formio_config.form_revision)
        ? (qgFormsIoSettings.form_metadata.form_name =
            formio_config.form_name + "/v/" + formio_config.form_revision)
        : (console.log("Revision fallsback"),
            (qgFormsIoSettings.form_metadata.form_name = formio_config.form_name));

    //Init form
    Formio.icons = qgFormsIoSettings.config.defaultIcons;
    Formio.use(premium);
    Formio.setBaseUrl(qgFormsIoSettings.config.baseUrl);
    Formio.setProjectUrl(qgFormsIoSettings.config.baseUrl + "/" + qgFormsIoSettings.form_metadata.project_name);
    Formio.createForm(
        document.getElementById("formio"),
        qgFormsIoSettings.config.baseUrl +
        "/" +
        qgFormsIoSettings.form_metadata.project_name +
        "/" +
        qgFormsIoSettings.form_metadata.form_name,
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
            hooks: {
                beforeSubmit: (submission, next) => {
                    $("[name^='data[submit']").prop('disabled', true).addClass('disabled');
                    next();
                }
            }
        }).then(function (wizard) {
        window.form = wizard;
        formName = form._form.title;
        formModified = form._form.modified;

        //Force new tab on formlinks
        qgFormsIoSettings.config.body_container.on(
            "click",
            qgFormsIoSettings.config.formio_container + " a",
            function (e) {
                e.target.target = "_blank";
            }
        );

        //   qgFormsIoSettings.onWizardChange();
        qgFormsIoSettings.onWizardSubmit(wizard);
        wizard.on("submitButton", function (submissionData) {
            $("[name^='data[submit']").prop('disabled', true).addClass('disabled');
            setTimeout(function (){
                $("[name^='data[submit']").prop('disabled', false).removeClass('disabled');
            }, 2000);
        });
    });

};

//Persistant fix for iPhone/Safari
window.onpageshow = function (event) {
    if (event.persisted) {
        window.location.reload();
    }
};
