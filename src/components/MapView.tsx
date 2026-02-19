import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Fix default marker icons
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  color?: string;
  popup?: string;
  label?: string;
}

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  highlightId?: string;
  highlightedIds?: string[];
  onMarkerClick?: (id: string) => void;
  className?: string;
  height?: string;
  enableClustering?: boolean;
  circle?: { center: [number, number]; radius: number };
  mapInstanceRef?: React.MutableRefObject<L.Map | null>;
}

function createColorIcon(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 24px; height: 24px; border-radius: 50% 50% 50% 0;
      background: ${color}; transform: rotate(-45deg);
      border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "><div style="
      width: 10px; height: 10px; border-radius: 50%;
      background: white; position: absolute;
      top: 5px; left: 5px; transform: rotate(45deg);
    "></div></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}

export function MapView({
  center = [-22.786, -50.205],
  zoom = 15,
  markers = [],
  highlightId,
  highlightedIds = [],
  onMarkerClick,
  className = "",
  height = "400px",
  enableClustering = false,
  circle,
  mapInstanceRef,
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(center, zoom);
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    if (mapInstanceRef) mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      if (mapInstanceRef) mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers/clusters
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    if (enableClustering) {
      const clusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        disableClusteringAtZoom: 18,
      });

      markers.forEach((m) => {
        const isHighlighted = m.id === highlightId || highlightedIds.includes(m.id);
        const icon = createColorIcon(isHighlighted ? "#ef4444" : (m.color || "#0a3d91"));
        const marker = L.marker([m.lat, m.lng], { icon });

        if (m.popup) marker.bindPopup(m.popup);
        if (m.label) marker.bindTooltip(m.label, { permanent: false, direction: "top" });
        if (onMarkerClick) marker.on("click", () => onMarkerClick(m.id));

        clusterGroup.addLayer(marker);
      });

      map.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;
    } else {
      markers.forEach((m) => {
        const isHighlighted = m.id === highlightId || highlightedIds.includes(m.id);
        const icon = createColorIcon(isHighlighted ? "#ef4444" : (m.color || "#0a3d91"));
        const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);

        if (m.popup) marker.bindPopup(m.popup);
        if (m.label) marker.bindTooltip(m.label, { permanent: m.id === highlightId, direction: "top" });
        if (onMarkerClick) marker.on("click", () => onMarkerClick(m.id));
      });
    }
  }, [markers, highlightId, highlightedIds, onMarkerClick, enableClustering]);

  // Circle overlay
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
      circleRef.current = null;
    }
    if (circle) {
      circleRef.current = L.circle(circle.center, {
        radius: circle.radius,
        color: "#0a3d91",
        fillColor: "#0a3d91",
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: "6 4",
      }).addTo(map);
    }
  }, [circle]);

  const prevCenterRef = useRef(center);
  const prevZoomRef = useRef(zoom);

  useEffect(() => {
    if (!mapRef.current) return;
    const [pLat, pLng] = prevCenterRef.current;
    const [cLat, cLng] = center;
    if (pLat !== cLat || pLng !== cLng || prevZoomRef.current !== zoom) {
      mapRef.current.flyTo(center, zoom, { duration: 0.8 });
      prevCenterRef.current = center;
      prevZoomRef.current = zoom;
    }
  }, [center, zoom]);

  return (
    <div
      ref={containerRef}
      className={`rounded-lg overflow-hidden border ${className}`}
      style={{ height }}
    />
  );
}
