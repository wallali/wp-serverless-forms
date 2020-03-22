document.addEventListener("DOMContentLoaded", function() {
  var serializeForm = function(form) {
    // Setup our serialized data
    var serialized = [];

    // Loop through each field in the form
    for (var i = 0; i < form.elements.length; i++) {
      var field = form.elements[i];

      // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
      if (
        !field.name ||
        field.disabled ||
        field.type === "file" ||
        field.type === "reset" ||
        field.type === "submit" ||
        field.type === "button"
      )
        continue;

      // If a multi-select, get all selections
      if (field.type === "select-multiple") {
        for (var n = 0; n < field.options.length; n++) {
          if (!field.options[n].selected) continue;
          serialized.push({
            name: field.name,
            value: field.options[n].value
          });
        }
      }

      // Convert field data to a query string
      else if (
        (field.type !== "checkbox" && field.type !== "radio") ||
        field.checked
      ) {
        serialized.push({
          name: field.name,
          value: field.value
        });
      }
    }

    return serialized;
  };

  const allForms = document.querySelectorAll("form[data-shifter='true'], .wpcf7 form, .gform_wrapper form");
  const method = "post";
  const headers = { Accept: "application/json" };
  const url = wp.wp_sls_forms_endpoint;

  allForms.forEach(form => {
    // Remove attributes
    form.removeAttribute("action");
    form.removeAttribute("method");
    form.removeAttribute("enctype");
    form.removeAttribute("novalidate");
    form.setAttribute("data-wp-sls-forms", true);
    
    // Inputs
    const inputs = form.querySelectorAll("input");
    
    // Add HTML required attribute
    inputs.forEach(input => {
      if(input.getAttribute("aria-required") === "true") {
        input.required = true;
      }
    });

    // On submit
    form.addEventListener("submit", function(el) {
      el.preventDefault();
      el.target.submit.disabled = true;
      const fields = serializeForm(el.target);
      const data = {
        id: null,
        blogname: wp.blogname,
        form_name: form.getAttribute("name"),
        host_name: window.location.hostname,
        pathname: window.location.pathname,
        site_id: null,
        email: [wp.admin_email],
        fields: fields
      };

      function success(res, el) {
        el.target.submit.disabled = false;
        el.target.querySelector('input[type="submit"]').blur();
        el.reset();
      }

      function error(err, el) {
        el.target.querySelector('input[type="submit"]').disabled = false;
        console.log(error);
      }

      axios({
        method: method,
        url: url,
        data: data,
        headers: headers
      })
        .then(function(res) {
          success(res, el);
          console.log(res);
        })
        .catch(function(err) {
          error(err, el);
          console.log(error);
        });
    });
  });
});
