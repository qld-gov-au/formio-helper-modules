# Form.io widget for Squiz Matrix

## How does it work?

- Official published guide (https://www.qld.gov.au/_resources/matrix-documentation/components/formio-forms)

## Development assets

- Container template #177549
- Footer scripts #146360
- Header scripts #167565
- Test page(s) (https://www.qld.gov.au/dev/formio-widget/test/_nocache)

## Production assets

- Container template #144179
- Footer scripts #144219
- Header scripts #144316
- Production page (https://www.qld.gov.au/contact-us)

### The content container template (#144179) contains:

#### Metadata schema (input values):

- Project name (project name set in Form.io)
- Form name (name of form under project mentioned above)
- Revision number (used to pull exact version otherwise fallback to latest)
- Confirmation page (relative URL behind qld.gov.au, e.g. qld.gov.au/contactus/response would be 'contactus/response' as value)
- Form.io environment URL (used to set the Form.io environment i.e, Production or Test)

#### Paint layout (interface between script/user values)

- NoScript/unsupported browser
- Loader DOM object/spinner (#formio)
- Formio config object (repeats values entered in metadata schema and is used by formio-loader.js script)

#### Header styles (see guide):

- Formio CSS, JS and premium CSS/JS
- QGOV CSS overrides (asset in this repository under src/styles.css)
- Footer extras (see guide):
- formio-loader.js (this repository)
- browser-support.js (this repository contains a copy)

---

### Code under paint layout:

- No script and unsupported browser

```html
<!-- No JS -->
<noscript>
  <div class="status warn">
    <h2>Javascript is disabled in your browser</h2>
    <p>
      To use this contact form, you must have Javascript enabled in your
      browser. Please
      <a href="https://www.enable-javascript.com/" target="_blank"
        >enable JavaScript</a
      >
      and try again.
    </p>
    <p>Alternatively, you can use another contact option.</p>
  </div>
  <style>
    .formio_container {
      display: none !important;
    }
  </style>
</noscript>
<!-- Not supported-->
<div class="alert alert-danger d-none" id="browser-warning" role="alert">
  <p>
    Your browser is not suppported. Some functionality might not work as
    expected.
  </p>
  <p>
    Please upgrade your browser to a version on the
    <a href="https://www.forgov.qld.gov.au/browser-support-lists"
      >supported browser list</a
    >
  </p>
</div>
```

- Formio container used to load the script/show loader before it finishes:

```html
<!-- Form/Loader-->
<div id="formio" class="formio_container">
  <img src="./?a=126703" />
</div>
```

- The most important part is the formio_config object which outputs values provided by Agency users (e.g. Form name, project name, redirect page etc)

```html
<!-- Object for footer loader-->
<script type="text/javascript">
  var formio_config = {
        project_name: "%asset_metadata_project-name%", 
        form_name: "%asset_metadata_form-name%", 
        form_confirmation: "%asset_metadata_form-confirmation%"%begin_asset_metadata_form-revision%,
        form_revision: "%asset_metadata_form-revision%"%end_asset_metadata_form-revision%,
        env_url: "%begin_asset_metadata_env-url^eq:test% qol-formio-t-api.azurefd.net %else_asset% api.forms.platforms.qld.gov.au %end_asset%"
  };
</script>
```

### Required assets in Matrix:

#### #144316 (header styles):

- contains Font awesome, formio lib (JS), formio lib (CSS), formio premium (CSS and JS)
- QGOV css overrides (see ./src/styles)

```html
<link
  rel="stylesheet"
  href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
/>
<link
  rel="stylesheet"
  href="https://unpkg.com/formiojs@latest/dist/formio.full.min.css"
/>
<script src="https://unpkg.com/formiojs@latest/dist/formio.full.min.js"></script>
<!-- Form io CSS -->
<link href="./?a=132931" rel="stylesheet" />
<script src="./?a=132932"></script>
<!-- QGOV Form.io overrides -->
<link href="./?a=167559" rel="stylesheet" />
```

#### #144219 (footer extras) contains:

- formio-loader.js (./src/script.js in this repository)
- browser-support.js (lives in Matrix, a copy is available under ./matrix-asset-examples in this repository)

```html
<!--@@ Require javascript @@-->
<script type="text/javascript" src="./?a=146359"></script>
<!-- formio-loader.js, see ./src/script.js -->
<script type="text/javascript" src="./?a=171638"></script>
<!-- browser-support.js, see ./matrix-asset-examples/ in this repository-->
```

### To debug/run:

- Run 'npm i' to trigger post install which will obfuscate and place a distributable copy under /dist
- Copy contents of ./dist/script.min.js OR ./src/script.js and replace contents of formio-loader.js

### Optional TO DO's:

- Setup gitbridge to pull from live repository master branch (when new release is available)
- Setup dev versions to use /dev or similar lower branch
