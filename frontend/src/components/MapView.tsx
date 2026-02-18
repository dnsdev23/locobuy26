'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Product {
    id: string;
    name: string;
    price: number;
    distance: number;
    pickup_location: {
        id: string;
        name: string;
        address: string;
        latitude: number;
        longitude: number;
    };
}

interface MapViewProps {
    userLocation: { lat: number; lng: number };
    products: Product[];
    onProductClick?: (product: Product) => void;
}

export default function MapView({ userLocation, products, onProductClick }: MapViewProps) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        // Initialize map
        const map = L.map(mapContainerRef.current).setView(
            [userLocation.lat, userLocation.lng],
            13
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        // Add user location marker
        const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
        <div style="
          background: #2563eb;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        "></div>
      `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });

        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
            .addTo(map)
            .bindPopup('<strong>您的位置</strong>');

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [userLocation]);

    useEffect(() => {
        if (!mapRef.current) return;

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        // Group products by pickup location
        const locationMap = new Map<string, { location: any; products: Product[] }>();

        products.forEach((product) => {
            const locId = product.pickup_location.id;
            if (!locationMap.has(locId)) {
                locationMap.set(locId, {
                    location: product.pickup_location,
                    products: [product],
                });
            } else {
                locationMap.get(locId)?.products.push(product);
            }
        });

        // Create markers for each location
        locationMap.forEach(({ location, products: locProducts }) => {
            const productIcon = L.divIcon({
                className: 'product-location-marker',
                html: `
          <div style="
            background: white;
            border: 2px solid #2563eb;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #2563eb;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-size: 12px;
          ">
            ${locProducts.length}
          </div>
        `,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            });

            const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px;">${location.name}</h3>
          <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">${location.address}</p>
          <p style="font-size: 12px; color: #2563eb; font-weight: 600;">
            附近有 ${locProducts.length} 個商品
          </p>
        </div>
      `;

            const marker = L.marker([location.latitude, location.longitude], { icon: productIcon })
                .addTo(mapRef.current!)
                .bindPopup(popupContent);

            marker.on('click', () => {
                if (onProductClick && locProducts.length > 0) {
                    onProductClick(locProducts[0]);
                }
            });

            markersRef.current.push(marker);
        });

        // Fit bounds to show all markers
        if (products.length > 0) {
            const bounds = L.latLngBounds(
                products.map((p) => [p.pickup_location.latitude, p.pickup_location.longitude])
            );
            bounds.extend([userLocation.lat, userLocation.lng]);
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [products, onProductClick, userLocation]);

    return (
        <div
            ref={mapContainerRef}
            className="w-full h-full rounded-lg overflow-hidden shadow-lg"
            style={{ minHeight: '400px' }}
        />
    );
}
