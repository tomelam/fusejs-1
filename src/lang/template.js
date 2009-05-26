  /*----------------------------- LANG: TEMPLATE -----------------------------*/

  Fuse.addNS('Template', {
    'constructor': (function() {
      function Template(template, pattern) {
        if (!(this instanceof Template))
          return new Template(template, pattern);

        this.template = Fuse.String(template);

        pattern = pattern || Fuse.Template.Pattern;
        if (!Fuse.Object.isRegExp(pattern))
          pattern = new Fuse.RegExp(Fuse.RegExp.escape(String(pattern)));
        if (!pattern.global)
          pattern = Fuse.RegExp.clone(pattern, { 'global': true });
        this.pattern = pattern;
      }
      return Template;
    })(),

    'evaluate': (function() {
      function evaluate(object) {
        if (object) {
          if (typeof object.toTemplateReplacements === 'function')
            object = object.toTemplateReplacements();
          else if (typeof object.toObject === 'function')
            object = object.toObject();
        }

        return this.template.replace(this.pattern, function(match, before, escaped, expr) {
          before = before || '';
          if (before === '\\') return escaped;
          if (object == null) return before;

          // adds support for dot and bracket notation
          var comp, ctx = object, 
           value   = ctx,
           pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;

          match = pattern.exec(expr);
          if (match == null) return before;

          while (match != null) {
            comp  = match[1].indexOf('[') === 0 ? match[2].replace(/\\]/g, ']') : match[1];
            value = ctx[comp];
            if (!Fuse.Object.hasKey(ctx, comp) || value == null) {
              value = ''; break;
            }
            if ('' == match[3]) break;
            ctx   = value;
            expr  = expr.substring('[' == match[3] ? match[1].length : match[0].length);
            match = pattern.exec(expr);
          }
          return before + Fuse.String.interpret(value);
        });
      }
      return evaluate;
    })()
  });

  Fuse.Template.Pattern = /(\\)?(#\{([^}]*)\})/;
