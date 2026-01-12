# Mikurando Backend

## Setup & Installation
1. **Dependencies installieren:**
   ```bash
   cd mikurando-backend
   npm install
   ```

2. **Umgebungsvariablen (.env):** <br>
   Die Datei `.env` ist im `.gitignore` und muss lokal erstellt werden. Es gibt allerdings eine `.env.template` Datei, 
in welcher angegeben ist, welche Secrets in die `.env` Datei gehören, wenn ein neues Secret hinzugefügt wird, bitte auch 
den stub in der `.template` datei hinzufügen.  Keine Passwörter in der Template Datei!
   

3. **Server starten:** <br> 
    Zum Starten des Servers einfach 
   ```bash
   npm run dev
   ```
   in der Konsole eingeben. <br> 
   Der Server läuft standardmäßig auf `http://localhost:3000`.

---

## Projektstruktur & Architektur

In einer Layered Architecture werden Logik, Datenbankzugriff, SQL-Befehle und Routing werden getrennt um Wiederverwendbarkeit, Lesbarkeit und Wartbarkeit zu Fördern. <br>


Weiters wird nach dem **Spec-First** Ansatz entwickelt, sprich beim Implementieren der Controller bitte in den API specs nachsehen
welcher `Pfad`, welche `Parameter`, welcher `Request Body` und welche `Responses` möglich sind / vom Frontend erwartet werden.


### Datenfluss eines Requests

1.  **Server (`server.js`):** <br> 
    Der Einstiegspunkt der Applikation. Hier wird definiert, unter welchem Pfad eine Routen-Datei erreichbar ist. 


2.  **Router (`src/routes/`):** <br> 
    Nimmt den Request entgegen und legt fest, welche Checks in welcher Reihenfolge durchlaufen werden müssen, bevor der Request an den Controller geht.


3.  **Middleware (`src/middleware/`):** <br>
    Prüft den Request, **bevor** Business-Logik oder Datenbankzugriffe passieren, weil diese sind langsam
    *   **Input-Validierung:** Sind alle Pflichtfelder im Body vorhanden?
    *   **Daten-Integrität:** Sind die Werte erlaubt? (z.B. `role` muss 'CUSTOMER' oder 'OWNER' sein, siehe Enum-Checks).
    *   **Authentifizierung & Autorisierung:** Ist ein gültiges JWT Token vorhanden? Hat der User die nötigen Rechte (nur Admins dürfen User löschen)? <br>
    
    Wenn ein Check fehlschlägt, sendet die Middleware sofort einen Error und bricht ab. Keine weitere Middleware wird ausgeführt
und auch der Controller wird nicht ausgeführt.


4.  **Controller (`src/controllers/`):**
    Enthält die eigentliche Business-Logik. Er ruft Models auf und sendet die finale Antwort an den Client.

5.  **Model (`src/models/`):**
    Die Models führen Datenbankoperationen auf, sie werden von den Controllern aufgerufen.

6.  **Query (`src/queries/`):**
    Enthält die reinen SQL-Strings für die Models.

### Ordnerstruktur 
Was kommt in welchen Ordner?

| Ordner | Beschreibung                                                                                                                                                                                                                                                         |
| :--- |:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **`routes/`** | Definiert Endpoints (URLs) und verknüpft sie mit Middlewares & Controllern. <br> Für jede Kategorie in den API specs einen eigenen Endpoint (Auth, Restaurants, Orders, ...)                                                                                       _ |
| **`middleware/`** | Code, der vor dem Controller läuft. <br> Hier wird gecheckt ob der Input vollständig ist, ob der Input Korrekt ist, ob die Rechte Stimmen, usw...  <br> Hier werden keine 'teuren' DB Aufrufe gemacht, oder ausgelöst (außnahme: Siehe Implementierungsanleitung).   |
| **`controllers/`** | Die eigentliche Logik, die den State der Applikation verändert. Sie nimmt die Requests, ruft die Models auf um Sachen zu verändern, und sendet den Response zurück. <br> Hier werden keine direkten DB Aufrufe gemacht, allerdings ausgelöst.                        |
| **`models/`** | Die Schnittstelle zur Datenbank. Führt die SQL-Queries aus. <br> Hier wird keine Business Logik implementiert, nur DB-Aufrufe.                                                                                                                                       |
| **`queries/`** | Nur Konstanten mit SQL-Strings. <br> Dadurch können SQL-Befehle leicht debuggt, angepasst und wiederverwendet werden.                                                                                                                                                |
| **`database/`** | Verbindung zu Datenbank, Datenbank Schema und so stuff.                                                                                                                                                                                                              |

---

## Wie implementiere ich einen neuen Endpoint?

Wie bereits gesagt wird nach dem **Spec-First** Ansatz entwickelt. <br> 
Heißt:
1. Sich **vor** dem Implementieren einen Endpoint Laut API specs aussuchen
2. Github Branch erstellen (Branch Name: `backend-endpointName`) und publishen 
3. Model Erstellen / Erweitern. Ein bestehendes Modell erweitern bzw ein neues erstellen. Dazu muss sich überlegt werden, 
<br> welche Datenbankaufrufe gemacht werden müssen. Parallel zum Model muss auch das dazugehörige Query File angepasst werden. <br>
Der neue Befehl wird als Konstante hinterlegt. Wichtig ist, prepared Statements, sprich für Platzhalter für Variablen zu verwenden.
4. Controller Logik Schreiben. Dazu müssen aus dem request Body die Daten extrahiert werden. Welche Daten im Body stehen ist in den API-specs spezifiziert. <br>
Es kann davon ausgegangen werden, dass alle notwendigen Daten vorhanden sind und diese auch valide sind, da dies in der `Middleware` geprüft wird. <br>
Nach dem Extrahieren kommt die Business Logik. Sollte für einen Check ein Datenbankauruf nowendig sein, ist dieser allerdings 
auch vom Controller zu handlen, nur er darf diese initiieren. Dazu das zuvor erstellte Model aufrufen.
Nach Business Logik und diversen DB-Calls ist eine Erfolgsmeldung zurückzugeben. Welche ist in den API-Specs spezifiziert und auch
der Response Body ist dort festgelegt. Bitte nachsehen, das Frontend verlässt sich nämlich darauf. <br> 
Auch noch wichtig, bei Datenbank aufrufen ist ein try catch notwendig. 
5. Neue Middleware schreiben und in den Endpoint einbinden. <br>
Ist der Controller geschrieben geht es an die Middleware. 
In der Middleware wird der Request validiert: sind alle Parameter vorhanden, sind die Parameter valide und auch,
hat der User die Rechte das zu tun, was er tun möchte, bzw. ist der user überhaupt eingeloggt.<br>
Wichtig! In der Middleware werden keine Datenbankaufrufe ausgelöst. Checks wie 'isAdmin' können mit dem JWT gemacht werden. <br>
Außnahme!!! Ressourcen-Check (Ist das mein Restaurant / meine Order): Hier darf/muss die Middleware ausnahmsweise die DB fragen. <br>
Datenbankaufrufe werden nur vom Controller ausgelöst. Wenn nicht gibt es ein Early Return mit entsprechendem status code.
Welcher Status Code folgt unten und in den API-Specs ist ebenfalls spezifiert welche antwortmöglichkeiten ein Request haben kann.
6. Damit sind wir fast fertig. Im `routes` folder nach dem richtigen Endpoint suchen oder einen neuen Route Endpoint erstellen. (Bei einem neuen Endpoint muss dieser in `server.js` eingebunden werden.) <br>
Im Endpoint bereits vorhandene Middleware wiederverwenden (checks bzgl. Datenbank-Enums befinden sich z.B. in `middleware/enumValidation`). 
Und für die neuen checks die Eben geschriebene Middleware einbinden. Als letztes noch auf den Controller verweisen. Und fertig.
7. Die ganzen abgedeckten Fehlerfälle, sowie den Good case einmal durchtesten
8. Branch Mergen.

---

## Status Codes:
Welcher Request welche Response Codes haben kann steht in den API specs. <br> 
Welcher Response Code wann gesendet wird, ist folgendermaßen definiert.
*   `200`: OK
*   `201`: Created
*   `400`: Bad Request (Validation Fehler)
*   `401`: Unauthorized (Kein Login / Login Abgelaufen)
*   `403`: Forbidden (Falsche Rolle / Account gebannt)
*   `404`: Not Found
*   `409`: Conflict (User / Dish / ... existiert schon)
*   `418`: I'm a Teapot (siehe API spec)
*   `500`: Server Error
---

## TLDR
* Implementieren anhand von Datenbankschema + API Specs
* Logik Aufteilen
  * SQL queries nur in `queries/`
  * Datenbankaufrufe nur in `models/`
  * Model Aufrufe + Business Logik **nur** in `controllers/`
  * Validierung in `middleware`
* Prepared Statements für SQL Queries
* Request + Response Body laut API