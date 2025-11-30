# Portfolio - cosmincalin.es

Personal portfolio website for Cosmin Calin.

## Deployment

This is a static HTML site deployed via Dokploy with Docker.

### Local Development

Simply open `index.html` in your browser.

### Docker Build

```bash
docker build -t portfolio .
docker run -p 8080:80 portfolio
```

## Structure

```
portfolio/
├── index.html      # Main HTML file
├── assets/
│   ├── personal_gallery/  # Photo gallery images
│   └── profile/           # Profile images
├── Dockerfile      # Docker config for deployment
└── README.md
```
