import { Component, OnInit, Inject, PLATFORM_ID, AfterViewInit, NgZone, Input} from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { MapDataService } from '../../shared/map-data-service';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class MapComponent implements AfterViewInit {
  @Input() customerLocation: { lat: number; lng: number } | null = null;
  @Input() showConnection: boolean = true;
  @Input() restaurantId: number | null = null;
  @Input() restaurantData: any = null;
  
  private map: any;
  private currentRadiusCircle: any = null;

  constructor(
    private mapService: MapDataService,
    private router: Router,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {console.log('Platform ID:', this.platformId);}

  async ngAfterViewInit(): Promise<void> {
    // If we are not in browser leaflet will crash
    if (isPlatformBrowser(this.platformId)) {
      console.log('Starte Map Initialisierung...');

      // in browser -> now we can safely load leaflet
      const L = await import('leaflet');

      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
        console.error('Map Container nicht gefunden!');
        return;
      }

      // Wenn restaurantData vorhanden ist (für Delivery Tracking), zeige nur dieses Restaurant
      if (this.restaurantData && this.customerLocation) {
        console.log('Delivery Tracking Modus - Zeige spezifisches Restaurant und Lieferadresse');
        
        const userLat = this.customerLocation.lat;
        const userLng = this.customerLocation.lng;
        
        this.initMap(L, userLat, userLng);
        this.addUserMarker(L, userLat, userLng, 'Lieferadresse');
        this.addRestaurantMarker(L, this.restaurantData);
        this.drawOSRMRoute(L, this.restaurantData.geo_lat, this.restaurantData.geo_lng, userLat, userLng);
        
        return;
      }

      // Normaler Modus: Zeige alle Restaurants
      this.mapService.getDataForMap().subscribe({
        next: (data: any) => {
          console.log('Daten empfangen:', data);
          const user = data.user.data;
          const restaurants = data.restaurants;

          // Nutze Kundenkoordinaten wenn vorhanden, sonst Standard
          const userLat = this.customerLocation?.lat || user.geo_lat;
          const userLng = this.customerLocation?.lng || user.geo_lng;
          const userName = 'Lieferadresse';

          this.initMap(L, userLat, userLng);
          this.addUserMarker(L, userLat, userLng, userName);
          this.addRestaurantMarkers(L, restaurants);
          
          // Zeichne Verbindung nur wenn showConnection true und customerLocation vorhanden
          if (this.showConnection && this.customerLocation) {
            this.drawConnectionLine(L, userLat, userLng, restaurants);
          }
        },
        error: (err: any) => console.error('Fehler beim Laden der Map-Daten', err)
      });
    }
  }

  private initMap(L: any, lat: number, lng: number): void {
    const startLat = lat || 48.2082;
    const startLng = lng || 16.3738;

    this.map = L.map('map').setView([startLat, startLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
  }

  private addUserMarker(L: any, lat: number, lng: number, name: string): void {
    if (!lat || !lng) {
      console.warn('Keine Koordinaten für User Marker gefunden:', lat, lng);
      return;
    }

    const userIcon = L.icon({
      iconUrl: 'assets/user-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    L.marker([lat, lng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup(`<b>${name}</b><br>Lieferadresse`)
  }

  private addRestaurantMarker(L: any, restaurant: any): void {
    if (!restaurant.geo_lat || !restaurant.geo_lng) {
      console.warn('Keine Koordinaten für Restaurant gefunden');
      return;
    }

    const restIcon = L.icon({
      iconUrl: 'assets/restaurant-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    const marker = L.marker([restaurant.geo_lat, restaurant.geo_lng], { icon: restIcon })
      .addTo(this.map);

    const container = document.createElement('div');
    container.className = 'popup-card';

    const title = document.createElement('h3');
    title.className = 'popup-card__title';
    title.innerText = restaurant.restaurant_name;
    container.appendChild(title);

    const info = document.createElement('p');
    info.className = 'popup-card__info';
    info.innerText = restaurant.category;
    container.appendChild(info);

    marker.bindPopup(container);
  }

  private addRestaurantMarkers(L: any, restaurants: any[]): void {
    const restIcon = L.icon({
      iconUrl: 'assets/restaurant-marker.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    restaurants.forEach((r: any) => {
      if (!r.geo_lat || !r.geo_lng) return;

      const marker = L.marker([r.geo_lat, r.geo_lng], { icon: restIcon })
        .addTo(this.map);

      const buttonId = `btn-navigate-${r.restaurant_id}`;
      const container = document.createElement('div');
      container.className = 'popup-card';

      const title = document.createElement('h3');
      title.className = 'popup-card__title';
      title.innerText = r.restaurant_name;
      container.appendChild(title);

      const info = document.createElement('p');
      info.className = 'popup-card__info';
      info.innerHTML = `
        ${r.category}<br>
        <span class="popup-card__meta">Radius: ${r.delivery_radius} km</span>
      `;
      container.appendChild(info);

      const btn = document.createElement('button');
      btn.innerText = 'ZUM MENÜ';

      // Sorry for not using mat-raised-button David, will not compile tried to replicate it
      btn.className = 'popup-card__action';

      btn.addEventListener('click', () => {
        this.zone.run(() => {
          this.router.navigate(['/restaurant', r.restaurant_id]);
        });
      });

      container.appendChild(btn);

      marker.bindPopup(container);


      marker.on('click', () => {
        // Delete old circle of wrong restaurant
        if (this.currentRadiusCircle) {
          this.map.removeLayer(this.currentRadiusCircle);
        }

        // draw delivery radius for restaurant
        this.currentRadiusCircle = L.circle([r.geo_lat, r.geo_lng], {
          color: 'blue',
          fillColor: '#30f',
          fillOpacity: 0.1,
          radius: (r.delivery_radius || 0) * 1000 // km -> m
        }).addTo(this.map);

        // Popu
        marker.on('popupopen', () => {
          const button = document.getElementById(buttonId);

          if (button) {
            button.addEventListener('click', () => {
              console.log('GOTO Restaurant')
              this.zone.run(() => {
                this.router.navigate(['/home']);
              });
            });
          }
        });
      });
    });
  }

  private drawConnectionLine(L: any, userLat: number, userLng: number, restaurants: any[]): void {
    // Wenn erste Restaurant vorhanden ist, zeichne Linie vom Customer zum Restaurant
    if (restaurants.length > 0) {
      const restaurant = restaurants[0];
      if (restaurant.geo_lat && restaurant.geo_lng) {
        const polyline = L.polyline(
          [[userLat, userLng], [restaurant.geo_lat, restaurant.geo_lng]],
          {
            color: '#3f51b5',
            weight: 3,
            opacity: 0.7,
            dashArray: '5, 5'
          }
        ).addTo(this.map);
      }
    }
  }

  private drawOSRMRoute(L: any, restLat: number, restLng: number, userLat: number, userLng: number): void {
    // Nutze OSRM (Open Source Routing Machine) für reale Route
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${restLng},${restLat};${userLng},${userLat}?geometries=geojson`;
    
    fetch(osrmUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
          
          // Zeichne die Route auf der Map
          const polyline = L.polyline(coordinates, {
            color: '#FF6B6B',
            weight: 4,
            opacity: 0.8,
            dashArray: '5, 5'
          }).addTo(this.map);
          
          // Zoome auf die Route
          this.map.fitBounds(polyline.getBounds());
          
          console.log(`OSRM Route gezeichnet - Entfernung: ${(route.distance / 1000).toFixed(2)} km, Dauer: ${(route.duration / 60).toFixed(0)} min`);
        }
      })
      .catch((err) => {
        console.error('Fehler beim Abrufen der OSRM Route:', err);
        // Fallback: Zeichne gerade Linie
        const polyline = L.polyline(
          [[restLat, restLng], [userLat, userLng]],
          {
            color: '#FF6B6B',
            weight: 4,
            opacity: 0.8
          }
        ).addTo(this.map);
        this.map.fitBounds(polyline.getBounds());
      });
  }
}
