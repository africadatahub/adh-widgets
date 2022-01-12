# ADH Widgets
## USAGE:

ADH Widgets uses [pym.js](http://blog.apps.npr.org/pym.js/)

Add this where widget should appear:

```html
<div id="adh-widget"></div>
```

Add this before closing `</body>` tag.


```html
<script type="text/javascript" src="https://pym.nprapps.org/pym.v1.min.js"></script>
<script>
    var pymParent = new pym.Parent('adh-widget', 'https://adh-widgets.netlify.app/?country=KEN', {});
</script>

```

### URL PARAMETERS:

Use the Alpha-2 or Alpha-3 ISO code to specify a country.
[Find ISO codes here.](https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes#:~:text=Current%20ISO%203166%20country%20codes%20%20%20,%20%20ALA%20%2015%20more%20rows%20) 


```javascript
?country=ZAF // Use the Alpha-3 or Alpha-2 ISO CODE
```

### OPTIONAL THEMING PARAMETERS:

Use the [TailwindCSS Palette](https://tailwindcss.com/docs/customizing-colors) 


```javascript
&accent= // &accent=blue-800 
&header_bg= // &header_bg=lime-100
&bg= // &bg=gray-100
&footer= // &footer=lime-100
```



