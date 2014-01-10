lbc-feed-filter
===============

Ce programme NodeJS a été prévu pour s'intercaller entre un flux RSS généré par le service http://lbc2rss.superfetatoire.com/ et un aggrégateur RSS.

Pour l'instant, il ne fait qu'aller chercher la description de chaque élément pour l'ajouter dans le flux.

Il y a un petit proxy PHP dans le dossier `proxy/` qui permet de contourner le blocage de certaines IPs (OVH, Online, ...) par Le Bon Coin.

## Usage

Ajouter dans l'aggrégateur RSS un flux sous la forme `http://[hôte]/lbc/[URL RSS]` où `[URL RSS]` est l'URL complète fournie par **lbc2rss**.
