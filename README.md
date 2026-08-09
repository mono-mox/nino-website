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

## Inhalte bearbeiten – eigenes CMS

Alle Texte, Bilder und Links liegen in `content.json`. Die Seiten laden diese Datei automatisch (`js/render.js`).

Zum Bearbeiten gibt es `admin.html` – eine eigene Seite mit Rich-Text-Editor (fett, kursiv, Listen, Links), Bild-Upload und Speichern-Button. Sie speichert Änderungen direkt als Commit im GitHub-Repo, danach baut GitHub Pages die Seite automatisch neu (dauert ca. 1 Minute).

**Einrichtung (einmalig):**

1. Auf github.com einloggen (als `mono-mox`)
2. Profilbild oben rechts → **Settings** → **Developer settings** (ganz unten im Menü) → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**
3. Bei **Repository access**: "Only select repositories" → `nino-website` auswählen
4. Bei **Permissions** → **Repository permissions** → **Contents**: auf **Read and write** stellen
5. Token erstellen und den angezeigten Code kopieren (nur einmal sichtbar!)
6. `admin.html` im Browser öffnen (z.B. `ninoborer.ch/admin.html`), oben GitHub-Benutzername (`mono-mox`), Repo-Name (`nino-website`) und das Token eintragen, auf "Zugangsdaten merken" klicken

Danach lädt die Admin-Seite automatisch die aktuellen Inhalte. Nino kann Texte, Icons, Bilder und Links ändern und mit **Speichern** direkt live stellen.

**Wichtig:** Das Token wird nur im Browser von Nino gespeichert (localStorage), nie an Dritte gesendet. Trotzdem sollte niemand anderes Zugriff auf dieses Token bekommen, da es Schreibrechte auf das Repo gibt. `admin.html` liegt zwar öffentlich auf der Website, ist aber ohne gültiges Token nutzlos.

## Inhalte manuell ersetzen (ohne CMS)

Alternativ direkt in `content.json` bearbeiten (über GitHub-Weboberfläche: Datei anklicken → Stift-Symbol) oder Dateien in `assets/` ersetzen.
