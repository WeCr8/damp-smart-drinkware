# DAMP Product Page Template System

## 🚀 Quick Start

### 1. Create Product Configuration
Copy `product-config-template.json` and customize:

```bash
cp product-config-template.json my-new-product.json
```

### 2. Generate Product Page
```bash
node ../tools/product-generator.js my-new-product.json
```

### 3. Add Product Images
Place images in: `../assets/images/products/[product-folder]/`

## 📋 Configuration Guide

### Required Fields
- `name`: Full product name
- `slug`: URL-friendly name (no spaces, lowercase)
- `folder`: Image folder name
- `image`: Main product image filename

### Optional Customization
- `features`: Array of 6 feature cards
- `specifications`: Array of technical specs
- `preorder.customFields`: Custom form fields
- `preorder.quantityOptions`: Pricing tiers

## 🎯 Examples

### Simple Product (Minimal Config)
```json
{
  "product": {
    "name": "DAMP Coaster v1.0",
    "slug": "damp-coaster-v1.0",
    "folder": "coaster",
    "image": "coaster.png"
  }
}
```

### Complex Product (Full Config)
See `product-config-template.json` for complete example.

## 🔧 Customization

### Adding Custom Form Fields
```json
"customFields": [
  {
    "type": "select",
    "id": "size",
    "label": "Size",
    "options": [
      {"value": "small", "text": "Small"},
      {"value": "large", "text": "Large"}
    ]
  }
]
```

### Brand-Specific Variations
For products like DAMP Handle with multiple brand compatibility:
```json
"customFields": [
  {
    "type": "select",
    "id": "brand",
    "label": "Cup Brand",
    "options": [
      {"value": "stanley-40oz", "text": "Stanley 40oz Quencher"},
      {"value": "yeti-30oz", "text": "Yeti 30oz Rambler"}
    ]
  }
]
```

## 🎨 Styling

All product pages use:
- `../assets/css/navigation.css` (Universal navigation)
- `../assets/css/product-page.css` (Product page styles)

## 📱 Mobile Optimization

Template automatically includes:
- Responsive design
- Safe area support
- Touch-friendly interactions
- Accessibility features

## 🔍 SEO Optimization

Each product page includes:
- Meta tags
- Open Graph
- Structured data
- Canonical URLs

## 🚀 Deployment

After generating:
1. Test locally
2. Optimize images
3. Add to git
4. Deploy to Netlify 