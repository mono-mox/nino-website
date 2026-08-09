# Website Nino Borer

Statische Website, GitHub Pages ready.

## Deploy (GitHub Pages)

1. Neues Repo erstellen unter github.com/mono-mox (z.B. `nino-website`)
2. Alle Dateien aus diesem Ordner in das Repo pushen (siehe Befehle unten)
3. Im Repo: Settings → Pages → Source: "Deploy from a branch" → Branch: `main` / `root`
4. In `CNAME` die Zeile `DEINE-DOMAIN.ch` durch die echte Domain ersetzen
5. Bei Hostpoint DNS-Einträge setzen (siehe unten)

## Git-Befehle

```bash
cd nino-website
git init
git add .
git commit -m "Erste Version der Website"
git branch -M main
git remote add origin https://github.com/mono-mox/nino-website.git
git push -u origin main
```

## DNS bei Hostpoint

Für eine Subdomain (z.B. `www.deine-domain.ch`):
- Typ: CNAME
- Name: `www`
- Wert: `mono-mox.github.io`

Für die nackte Domain (`deine-domain.ch` ohne www) — GitHub Pages braucht dafür A-Records statt CNAME:
- Typ: A, Name: `@`, Werte (4 Einträge):
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153

Danach im Repo unter Settings → Pages die Domain eintragen und "Enforce HTTPS" aktivieren (kann nach DNS-Propagation ein paar Minuten bis Stunden dauern).

## Inhalte ersetzen

- `assets/foto-nino.jpg` → echtes Foto (gleicher Dateiname oder Pfad in `index.html` anpassen)
- `assets/lebenslauf-nino-borer.pdf` → echter Lebenslauf (Datei in `assets/` ablegen)
- Texte in `index.html`, `kontakt.html`, `referenzen.html`, `beispiele.html` anpassen
