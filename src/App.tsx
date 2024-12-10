import {
  GoogleMap,
  HeatmapLayer,
  InfoWindow,
  Libraries,
  Marker,
  Polygon,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAddresses } from "./utils/fetchAddresses";
// import { fetchAndGeocodeAddresses } from "./utils/fetchAddresses";
import { DeliveryZone, LatLng } from "./interfaces";
import { v4 as uuidv4 } from "uuid";

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries: Libraries = ["places", "geometry", "visualization"];

const initialDeliveryZone = {
  deliveryZoneID: "",
  name: "",
  description: "",
  color: "",
  opacity: 0,
  coordinates: [],
};

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [markerPosition, setMarkerPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [markerPositionPlaceID, setMarkerPositionPlaceID] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [response, setResponse] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [center, setCenter] = useState({
    lat: -34.6036844,
    lng: -58.3815591,
  });
  const [infowindowContent, setInfowindowContent] = useState<string | null>(
    null
  );
  const [placeId, setPlaceId] = useState<string>("");
  const [placeId2, setPlaceId2] = useState<string>("");
  const [heatmapData, setHeatmapData] = useState<google.maps.LatLng[]>([]);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showCustomers, setShowCustomers] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<LatLng[]>([]);
  const [areaData, setAreaData] = useState<LatLng[]>([]);
  const [createArea, setCreateArea] = useState<boolean>(false);
  const [deliveryZone, setDeliveryZone] =
    useState<DeliveryZone>(initialDeliveryZone);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);

  const formRef = useRef<HTMLFormElement>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey,
    libraries,
  });

  useEffect(() => {
    // console.log("areaData zone", areaData);
    // console.log("coordinates zone", coordinates);

    console.log("deliveryZones", deliveryZones);
  }, [deliveryZone]);

  const geocode = useCallback(
    (request: google.maps.GeocoderRequest) => {
      if (!isLoaded || !google) {
        console.warn("Google Maps API no está cargada");
        return;
      }

      const geocoder = new google.maps.Geocoder();

      geocoder
        .geocode(request)
        .then((result) => {
          const { results } = result;
          if (results.length > 0) {
            setMarkerPosition(results[0].geometry.location.toJSON());
            setResponse(JSON.stringify(result, null, 2));
            setPlaceId2(results[0].place_id);
            // setCenter({
            // 	lat: results[0].geometry.location.lat(),
            // 	lng: results[0].geometry.location.lng(),
            // });
          }
        })
        .catch((e) => {
          alert("Geocode was not successful for the following reason: " + e);
        });
    },
    [isLoaded]
  );

  const handleAreaChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setDeliveryZone({
      ...deliveryZone,
      deliveryZoneID: uuidv4(),
      coordinates: areaData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSaveArea = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("deliveryZone", deliveryZone);
    setDeliveryZones([...deliveryZones, deliveryZone]);

    formRef.current?.reset();
    setDeliveryZone(initialDeliveryZone);
    setAreaData([]);
  };

  const handlePlaceIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlaceId(event.target.value);
    setInfowindowContent(null);
  };

  const handleGeocodeByPlaceId = useCallback(() => {
    if (!isLoaded || !google) {
      console.warn("Google Maps API no está cargada");
      return;
    }

    const geocoder = new google.maps.Geocoder();

    geocoder
      .geocode({ placeId })
      .then(({ results }) => {
        if (results && results.length > 0) {
          const location = results[0].geometry.location;
          setMarkerPositionPlaceID(location.toJSON());
          setCenter({
            lat: location.lat(),
            lng: location.lng(),
          });
          setInfowindowContent(results[0].formatted_address);
        } else {
          alert("No se encontraron resultados para el Place ID proporcionado.");
        }
      })
      .catch((e) => {
        console.error("Error en Geocode:", e);
        alert("Error al obtener la ubicación: " + e);
      });
  }, [isLoaded, placeId]);

  const addBoundaries = useCallback((map: google.maps.Map) => {
    if (!google) return;

    // const dataLayer = new google.maps.Data();
    // dataLayer.loadGeoJson('/export.geojson');

    // dataLayer.setStyle({
    // 	fillColor: '#FF0000',
    // 	fillOpacity: 0.3,
    // 	strokeColor: '#800000',
    // 	strokeWeight: 2,
    // });

    // dataLayer.setMap(map);

    const flightPlanCoordinates = [
      { lat: 28.0312296, lng: -81.9447321 },
      { lat: 28.0394654, lng: -81.9498042 },
      { lat: 27.949166, lng: -81.88510740000001 },
      { lat: 28.1726986, lng: -81.99406537 },
      { lat: 28.0905613, lng: -82.13471659999999 },
      { lat: 28.0407561, lng: -81.939437 },
      { lat: 28.0186323, lng: -82.1128641 },
      { lat: 28.0312296, lng: -81.9447321 },
    ];

    // const flightPath = new google.maps.Polyline({
    // 	path: flightPlanCoordinates,
    // 	geodesic: true,
    // 	strokeColor: '#FF0000',
    // 	strokeOpacity: 1.0,
    // 	strokeWeight: 2,
    // });

    const flightPath = new google.maps.Polygon({
      paths: flightPlanCoordinates,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.3,
    });

    flightPath.setMap(map);
  }, []);

  // const addAreaData = useCallback(
  // 	(map: google.maps.Map) => {
  // 		if (!isLoaded || !google) {
  // 			console.warn('Google Maps API no está cargada');
  // 			return;
  // 		}

  // 		const newHeatmapData = [
  // 			new google.maps.LatLng(-36.6167, -64.2833),
  // 			new google.maps.LatLng(-35.4167, -63.2833),
  // 			new google.maps.LatLng(-36.1667, -63.6667),
  // 			new google.maps.LatLng(-36.7333, -62.9667),
  // 			new google.maps.LatLng(-35.65, -63.1167),
  // 			new google.maps.LatLng(-36.5, -63.15),
  // 			new google.maps.LatLng(-36.9, -64.3667),
  // 			new google.maps.LatLng(-35.8833, -63.3167),
  // 			new google.maps.LatLng(-36.0333, -63.8833),
  // 			new google.maps.LatLng(-37.0333, -64.15),
  // 			new google.maps.LatLng(-35.7667, -63.75),
  // 			new google.maps.LatLng(-37.3667, -64.3667),
  // 			new google.maps.LatLng(-35.9167, -63.85),
  // 			new google.maps.LatLng(-37.1167, -63.9333),
  // 			new google.maps.LatLng(-35.3667, -63.5333),
  // 			new google.maps.LatLng(-36.25, -63.8),
  // 			new google.maps.LatLng(-37.2167, -64.0167),
  // 		];
  // 		setHeatmapData(newHeatmapData);
  // 	},
  // 	[isLoaded]
  // );

  const addHeatmapData = useCallback(() => {
    if (!isLoaded || !google) {
      console.warn("Google Maps API no está cargada");
      return;
    }

    const newHeatmapData = [
      new google.maps.LatLng(-36.6167, -64.2833),
      new google.maps.LatLng(-35.4167, -63.2833),
      new google.maps.LatLng(-36.1667, -63.6667),
      new google.maps.LatLng(-36.7333, -62.9667),
      new google.maps.LatLng(-35.65, -63.1167),
      new google.maps.LatLng(-36.5, -63.15),
      new google.maps.LatLng(-36.9, -64.3667),
      new google.maps.LatLng(-35.8833, -63.3167),
      new google.maps.LatLng(-36.0333, -63.8833),
      new google.maps.LatLng(-37.0333, -64.15),
      new google.maps.LatLng(-35.7667, -63.75),
      new google.maps.LatLng(-37.3667, -64.3667),
      new google.maps.LatLng(-35.9167, -63.85),
      new google.maps.LatLng(-37.1167, -63.9333),
      new google.maps.LatLng(-35.3667, -63.5333),
      new google.maps.LatLng(-36.25, -63.8),
      new google.maps.LatLng(-37.2167, -64.0167),
    ];
    setHeatmapData(newHeatmapData);
  }, [isLoaded]);

  const toggleHeatmap = () => {
    const totalPoints = heatmapData.length;
    const avgLat =
      heatmapData.reduce((sum, point) => sum + point.lat(), 0) / totalPoints;
    const avgLng =
      heatmapData.reduce((sum, point) => sum + point.lng(), 0) / totalPoints;

    setCenter({ lat: avgLat, lng: avgLng });
    setShowHeatmap((prev) => !prev);
  };

  const showCustomer = () => {
    setShowCustomers((prev) => !prev);
  };

  useEffect(() => {
    fetchAddresses("/data.csv")
      .then((geocodedLocations: LatLng[]) => {
        setCoordinates(geocodedLocations);
        setCenter({
          lat: geocodedLocations[0].lat,
          lng: geocodedLocations[0].lng,
        });
      })
      .catch((error: Error) =>
        console.error("Error fetching or geocoding addresses:", error)
      );
  }, []);

  // useEffect(() => {
  //   if (!showCustomers) return;

  //   if (coordinates.length === 0) {
  //     setIsLoading(true);

  //     fetchAddresses("/data.csv")
  //       .then((geocodedLocations: LatLng[]) => {
  //         setCoordinates(geocodedLocations);
  //         setCenter({
  //           lat: geocodedLocations[0].lat,
  //           lng: geocodedLocations[0].lng,
  //         });
  //       })
  //       .catch((error: Error) =>
  //         console.error("Error fetching or geocoding addresses:", error)
  //       )
  //       .finally(() => setIsLoading(false));
  //   }
  // }, [showCustomers, coordinates]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();

    if (lat && lng && createArea) {
      setAreaData((prevAreaData) => {
        if (prevAreaData.length < 100) {
          return [...prevAreaData, { lat, lng }];
        }
        return prevAreaData;
      });
    }
  };

  return (
    <div className="fixed top-0 flex w-full h-screen">
      <GoogleMap
        center={center}
        zoom={10}
        mapContainerStyle={{ width: "100%", height: "100%" }}
        // onLoad={(map) => {
        // 	addBoundaries(map);
        // 	addHeatmapData();
        // }}
        onClick={(e) => {
          handleMapClick(e);
        }}
        options={{
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {showCustomers &&
          coordinates &&
          coordinates.map((coordinate, index) => (
            <Marker key={index} position={coordinate} />
          ))}

        {markerPosition && <Marker position={markerPosition} />}

        {infowindowContent && (
          <InfoWindow position={markerPositionPlaceID!}>
            <div className="text-black">{infowindowContent}</div>
          </InfoWindow>
        )}

        {showHeatmap && (
          <HeatmapLayer data={heatmapData} options={{ radius: 50 }} />
        )}

        {areaData.length > 0 && (
          <Polygon
            paths={areaData}
            options={{
              strokeColor: deliveryZone.color,
              strokeOpacity: 1.0,
              strokeWeight: 2,
              fillColor: deliveryZone.color,
              fillOpacity: deliveryZone.opacity
                ? deliveryZone.opacity / 100
                : 0.3,
            }}
          />
        )}

        {deliveryZones.length > 0 &&
          deliveryZones.map((zone) => (
            <Polygon
              key={zone.deliveryZoneID}
              paths={zone.coordinates}
              options={{
                strokeColor: zone.color,
                strokeOpacity: 1.0,
                strokeWeight: 2,
                fillColor: zone.color,
                fillOpacity: zone.opacity ? zone.opacity / 100 : 0.3,
              }}
            />
          ))}
      </GoogleMap>

      <div className="flex flex-col w-full h-full max-w-xl gap-4 m-4">
        <form className="flex">
          <input
            type="text"
            placeholder="Enter a location"
            onBlur={(e) => {
              // geocode({ address: e.target.value });
              setAddress(e.target.value);
            }}
            className="w-full px-4 py-2 mr-2 rounded-xl"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              geocode({ address });
            }}
            className="rounded-xl"
          >
            Geocode
          </button>
        </form>

        <form className="flex">
          <input
            type="text"
            value={placeId}
            onChange={(e) => handlePlaceIdChange(e)}
            placeholder="Enter a place ID"
            className="w-full px-4 py-2 mr-2 rounded-xl"
          />

          <button
            onClick={(e) => {
              e.preventDefault();
              handleGeocodeByPlaceId();
            }}
            className="rounded-xl"
          >
            Geocode
          </button>
        </form>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between">
              {/* <div>
                <p>Latitud: {center.lat} </p>
                <p>Longitud: {center.lng}</p>
              </div> */}
              <button onClick={toggleHeatmap} className="rounded-xl">
                Show Heatmap
              </button>
              <button onClick={showCustomer} className="rounded-xl">
                Show Customer
              </button>
              <button
                onClick={() => setCreateArea(!createArea)}
                className="rounded-xl"
              >
                Create Area
              </button>
            </div>

            {createArea && (
              <form
                ref={formRef}
                autoComplete="off"
                onSubmit={(e) => handleSaveArea(e)}
                className="flex flex-col gap-2 mt-4"
              >
                <input
                  type="text"
                  value={deliveryZone.name}
                  name="name"
                  placeholder="Name of the area"
                  onChange={(e) => handleAreaChange(e)}
                  className="w-full px-4 py-2 mr-2 rounded-xl"
                />
                <textarea
                  value={deliveryZone.description}
                  name="description"
                  placeholder="Description"
                  onChange={(e) => handleAreaChange(e)}
                  className="w-full px-4 py-2 mr-2 rounded-xl"
                />
                <div className="flex gap-2 justify-center items-center">
                  <input
                    type="color"
                    name="color"
                    value={deliveryZone.color}
                    onChange={(e) => handleAreaChange(e)}
                  />
                  <label>Opacity: </label>
                  <input
                    type="range"
                    name="opacity"
                    min="0"
                    max="100"
                    value={deliveryZone.opacity}
                    onChange={(e) => handleAreaChange(e)}
                    // className=" mt-2 h-2 bg-[#491718] rounded-full  cursor-pointer range-slider"
                  />
                </div>

                <button type="submit" className="rounded-xl">
                  Save
                </button>
              </form>
            )}
            {placeId2 && <p className="break-words">Place ID: {placeId2}</p>}
          </div>

          {isLoading && (
            <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full bg-gray-800 bg-opacity-75 z-50">
              <p className="text-white text-lg">Loading...</p>
            </div>
          )}

          {response && (
            <div>
              <h3>Geocode Response:</h3>
              <pre className="p-2 mt-2 overflow-auto border h-2/6">
                {response}
              </pre>
            </div>
          )}

          {deliveryZone.deliveryZoneID && (
            <div>
              <h3 className="font-medium border-b">Delivery zone:</h3>
              <p>Name: {deliveryZone.name}</p>
              <p>Description: {deliveryZone.description}</p>
              <p>ID: {deliveryZone.deliveryZoneID}</p>
            </div>
          )}

          {/* {coordinates && (
						<div className='px-4'>
							{coordinates.map((coordinate) => (
								<li>
									{coordinate.lat} {coordinate.lng}
								</li>
							))}
						</div>
					)} */}
        </div>
      </div>
    </div>
  );
};

export default App;
