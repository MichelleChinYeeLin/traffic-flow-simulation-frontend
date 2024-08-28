import React, { useState, useEffect, useRef } from "react";
import ReactDOMServer from "react-dom/server";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  useMap,
  Polyline,
  ZoomControl,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import CustomiseIcon from "./assets/CustomiseIcon.jsx";
import VehicleIcon from "./assets/VehicleIcon";
import RoadIcon from "./assets/RoadIcon.jsx";
import TrafficSignalIcon from "./assets/TrafficSignalIcon.jsx";
import UpIcon from "./assets/UpIcon.jsx";
import DownIcon from "./assets/DownIcon.jsx";
import AddIcon from "./assets/AddIcon.jsx";
import ResetIcon from "./assets/ResetIcon.jsx";
import PlayIcon from "./assets/PlayIcon.jsx";
import PauseIcon from "./assets/PauseIcon.jsx";
import StopIcon from "./assets/StopIcon.jsx";

const Home = () => {
  const canvasVehicleRef = useRef(null);
  const canvasRoadRef = useRef(null);
  const canvasRoadNodeRef = useRef(null);
  const canvasTrafficSignalRef = useRef(null);

  const [mode, setMode] = useState("build");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [intervalId, setIntervalId] = useState();
  const [roadList, setRoadList] = useState([]);
  const [vehicleList, setVehicleList] = useState([]);
  const [trafficSignalList, setTrafficSignalList] = useState([]);
  const [junctionList, setJunctionList] = useState([]);

  // Build mode variables
  const [activatedBuildComponent, setActivatedBuildComponent] = useState("");
  const [activatedAddComponent, setActivatedAddComponent] = useState("");
  const [selectedTrafficSignal, setSelectedTrafficSignal] = useState();
  const [selectedRoadNode, setSelectedRoadNode] = useState();
  const [selectedRoad, setSelectedRoad] = useState();
  const [informationComponentCategory, setInformationComponentCategory] = useState();
  const [selectedTrafficSignalDuration, setSelectedTrafficSignalDuration] = useState();
  const [selectedJunctionTrafficSignalList, setSelectedJunctionTrafficSignalList] = useState();
  const [isShowingAlertModal, setIsShowingAlertModal] = useState(false);

  // Simulation mode variables
  const [fastForwardSpeed, setFastForwardSpeed] = useState(1);
  const [vehicleInFlow, setVehicleInFlow] = useState(1000);
  const minInFlow = 500;
  const maxInFlow = 2000;

  // Fetch and send data to API
  const fetchVehicleData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/vehicles", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const vehicleData = response.data?.data;

      if (vehicleData != null) {
        setVehicleList(vehicleData);
      }
    } catch (error) {
      console.error("Error fetching simulation data: ", error);
    }
  };

  const fetchRoadData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/roads", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setRoadList(response.data.data);
    } catch (error) {
      console.error("Error fetching simulation data: " + error);
    }
  };

  const fetchTrafficSignalData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/traffic-signals", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response !== "") {
        setTrafficSignalList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching simulation data: " + error);
    }
  };

  const fetchTrafficSignalInitData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/traffic-signals-init", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response !== "") {
        setTrafficSignalList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching simulation data: " + error);
    }
  };

  const fetchRoadResetData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/roads-reset", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setRoadList(response.data.data);
    } catch (error) {
      console.error("Error fetching simulation data: " + error);
    }
  };

  const fetchTrafficSignalResetData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/traffic-signals-reset", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response !== "") {
        setTrafficSignalList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching simulation data: " + error);
    }
  };

  const postSimulationStartRequest = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/simulation-start",
        {
          requestStart: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error starting simulation: " + error);
    }
  };

  const postSimulationResumeRequest = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/simulation-resume",
        {
          requestStart: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error resuming simulation: " + error);
    }
  };

  const postSimulationPauseRequest = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/simulation-pause",
        {
          requestStart: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error pausing simulation: " + error);
    }
  };

  const postSimulationStopRequest = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/simulation-stop",
        {
          requestStop: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setIsRunning(false);
    } catch (error) {
      console.error("Error stopping simulation: " + error);
    }
  };

  const postTrafficSignalConfig = async () => {
    try {
      // console.log(trafficSignalList);
      const response = await axios.post(
        "http://localhost:8080/api/traffic-signals-config",
        {
          config: trafficSignalList,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error posting traffic signals configuration: " + error.response.data);
    }
  };

  const postRoadConfig = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/roads-config",
        {
          config: roadList,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error posting roads configuration: " + error.response.data);
    }
  };

  const postSimulationSpeed = async () => {
    try {
      let speed;
      if (fastForwardSpeed === 1) {
        speed = 1;
      } else {
        speed = fastForwardSpeed * 2;
      }

      const response = await axios.post(
        "http://localhost:8080/api/simulation-speed",
        {
          speed: speed,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error posting simulation speed: " + error.response.data);
    }
  };

  const postVehicleInFlow = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/vehicle-in-flow",
        {
          vehicleInFlow: vehicleInFlow,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error posting vehicle in-flow: " + error.response.data);
    }
  };

  useEffect(() => {
    fetchRoadData();
    fetchTrafficSignalInitData();
  }, []);

  useEffect(() => {
    let updatedJunctionSet = new Set();
    if (trafficSignalList == null) {
      return;
    }
    trafficSignalList.forEach((trafficSignal) => {
      if (trafficSignal.junctionId != null) {
        updatedJunctionSet.add(trafficSignal.junctionId);
      }
    });
    const updatedJunctionList = Array.from(updatedJunctionSet);
    setJunctionList(updatedJunctionList);
  }, [trafficSignalList]);

  useEffect(() => {
    if (isRunning) {
      fetchVehicleData();
      fetchTrafficSignalData();

      let intervalSpeed = 500;

      if (fastForwardSpeed === 1) {
        intervalSpeed = 1000;
      }
      const interval = setInterval(() => {
        fetchVehicleData();
        fetchTrafficSignalData();
      }, intervalSpeed);
      setIntervalId(interval);

      return () => {
        clearInterval(intervalId);
      };
    } else {
      if (intervalId) {
        clearInterval(intervalId);
      }
    }
  }, [isRunning]);

  // Canvas Creation
  const CanvasOverlay = ({ canvasRef, draw }) => {
    const map = useMap();

    useEffect(() => {
      if (canvasRef.current != null) {
        canvasRef.current._map = map;
        updateCanvas();
      }
    }, [map]);

    const updateCanvas = () => {
      if (canvasRef.current) {
        if (
          (canvasRef === canvasVehicleRef || canvasRef === canvasTrafficSignalRef) &&
          mode === "build"
        ) {
          return;
        }
        const canvas = canvasRef.current;

        const ctx = canvas.getContext("2d");
        canvas.width = map.getSize().x;
        canvas.height = map.getSize().y;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw(map, ctx);
      }
    };

    useEffect(() => {
      if (canvasRef.current != null) {
        const canvas = canvasRef.current;

        let isDragging = false;

        if (canvasRef === canvasRoadRef && mode === "build") {
          canvas.addEventListener("mousedown", () => (isDragging = false));
          canvas.addEventListener("mousemove", () => (isDragging = true));

          if (activatedBuildComponent === "road" && activatedAddComponent == null) {
            canvas.addEventListener("mouseup", (e) => {
              if (!isDragging) {
                ClickRoadHandler(e);
              }
            });
          } else if (activatedBuildComponent === "road" && activatedAddComponent === "road") {
            canvas.addEventListener("mouseup", (e) => {
              if (!isDragging) {
                AddRoadHandler(e);
              }
            });
          }
        }

        const map = canvas._map;
        map.on("move", updateCanvas);
        map.on("resize", updateCanvas);
        updateCanvas();
      }
    }, [vehicleList, roadList, trafficSignalList]);

    useEffect(() => {
      if (canvasRef.current != null && canvasRef === canvasRoadRef) {
        updateCanvas();
      }
    }, [selectedRoad]);

    return (
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex:
            canvasRef === canvasRoadRef ? 700 : canvasRef === canvasTrafficSignalRef ? 800 : 900,
          pointerEvents:
            mode === "build" && canvasRef === canvasRoadRef && activatedBuildComponent === "road"
              ? "auto"
              : "none",
          visibility:
            mode === "build"
              ? canvasRef !== canvasRoadRef && canvasRef !== canvasRoadNodeRef
                ? "hidden"
                : "visible"
              : "visible",
        }}
      />
    );
  };

  function drawVehicleMarkers(map, ctx) {
    if (vehicleList != null) {
      ctx.clearRect(0, 0, map.getSize().x, map.getSize().y);

      function drawCircleMarker(x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
      }

      vehicleList.forEach((vehicle) => {
        const point = map.latLngToContainerPoint([vehicle.yCoordinate, vehicle.xCoordinate]);
        drawCircleMarker(point.x, point.y, 2, "#1CA7EC");
      });
    } else {
      console.log("empty list");
    }
  }

  function drawRoadNodeMarkers(map, ctx) {
    if (roadList && ctx) {
      ctx.clearRect(0, 0, map.getSize().x, map.getSize().y);
    }

    function drawCircleMarker(x, y, radius, color) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
    }

    roadList.forEach((road) => {
      road.node.forEach((roadNode) => {
        let circleColor = "#000000";

        if (
          selectedRoadNode != null &&
          selectedRoad.id === road.id &&
          selectedRoadNode.roadNodeId === roadNode.roadNodeId
        ) {
          circleColor = "#FFEA00";
        }
        const point = map.latLngToContainerPoint([roadNode.yCoordinate, roadNode.xCoordinate]);
        drawCircleMarker(point.x, point.y, 2, circleColor);
      });
    });
  }

  function drawRoadPolylines(map, ctx) {
    if (roadList && ctx) {
      ctx.clearRect(0, 0, map.getSize().x, map.getSize().y);
      ctx.lineWidth = 3;

      roadList.forEach((road) => {
        const coordinates = road.node.map((node) =>
          map.latLngToContainerPoint([node.yCoordinate, node.xCoordinate])
        );

        let strokeColor = "#A9A9A9";
        if (selectedRoad != null && road.id === selectedRoad.id) {
          strokeColor = "#AF69EE";
        }

        ctx.strokeStyle = strokeColor;
        ctx.beginPath();
        ctx.moveTo(coordinates[0].x, coordinates[0].y);
        coordinates.slice(1).forEach((coord) => ctx.lineTo(coord.x, coord.y));
        ctx.stroke();
      });
    }
  }

  function drawTrafficSignalMarkers(map, ctx) {
    if (trafficSignalList != null && (isRunning || isPaused)) {
      ctx.clearRect(0, 0, map.getSize().x, map.getSize().y);

      const drawSquareMarker = (x, y, size, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      };

      trafficSignalList.forEach((trafficSignal) => {
        const point = map.latLngToContainerPoint([
          trafficSignal.yCoordinate,
          trafficSignal.xCoordinate,
        ]);
        if (trafficSignal.isActive) {
          drawSquareMarker(point.x, point.y, 8, "#6FC276");
        } else {
          drawSquareMarker(point.x, point.y, 8, "#C41E3A");
        }
      });
    }
  }

  const TrafficSignalMarkers = () => {
    const map = useMap();

    if (!trafficSignalList || trafficSignalList.size === 0) {
      return null;
    }

    const trafficSignalIconHTML = ReactDOMServer.renderToString(
      <div className="text-black">
        <TrafficSignalIcon />
      </div>
    );
    const selectedTrafficSignalIconHTML = ReactDOMServer.renderToString(
      <div className="text-[#AF69EE]">
        <TrafficSignalIcon />
      </div>
    );

    const LeafletTrafficSignalIcon = new L.divIcon({
      html: trafficSignalIconHTML,
      className: "traffic-signal-icon", // Add any custom class if needed
      iconSize: [20, 20], // Adjust size if needed
      iconAnchor: [10, 20], // Adjust anchor if needed
      popupAnchor: [0, -20],
    });

    const LeafletSelectedTrafficSignalIcon = new L.divIcon({
      html: selectedTrafficSignalIconHTML,
      className: "traffic-signal-icon", // Add any custom class if needed
      iconSize: [20, 20], // Adjust size if needed
      iconAnchor: [10, 20], // Adjust anchor if needed
      popupAnchor: [0, -20],
    });

    return (
      <div className="z-[1000]">
        {trafficSignalList.map((trafficSignal, index) => (
          <Marker
            key={index}
            position={[trafficSignal.yCoordinate, trafficSignal.xCoordinate]}
            icon={
              selectedTrafficSignal != null && trafficSignal.name === selectedTrafficSignal.name
                ? LeafletSelectedTrafficSignalIcon
                : LeafletTrafficSignalIcon
            }
            eventHandlers={{
              click: () => {
                if (activatedBuildComponent !== "traffic-signal") {
                  return;
                }

                let updatedSelectedJunctionTrafficSignalList = [];
                trafficSignalList.forEach((item) => {
                  if (item.junctionId === trafficSignal.junctionId) {
                    updatedSelectedJunctionTrafficSignalList.push(item);
                  }
                });

                let trafficSignalObject = trafficSignal;
                setSelectedTrafficSignal(trafficSignalObject);
                setInformationComponentCategory("Traffic Signal");
                setSelectedTrafficSignalDuration(trafficSignal.duration);
                setSelectedJunctionTrafficSignalList(updatedSelectedJunctionTrafficSignalList);
              },
            }}></Marker>
        ))}
      </div>
    );
  };

  // Simulation Controls
  async function handleStartSimulationButtonClick() {
    if (isRunning && !isPaused) {
      return;
    }

    if (isPaused) {
      await postSimulationResumeRequest();
    } else {
      await postRoadConfig();
      await postTrafficSignalConfig();
      await postVehicleInFlow();
      await postSimulationSpeed();
      await postSimulationStartRequest();
    }
    setIsRunning(true);
    setIsPaused(false);
  }

  async function handlePauseSimulationButtonClick() {
    if (!isRunning && isPaused) {
      return;
    }
    await postSimulationPauseRequest();
    setIsRunning(false);
    setIsPaused(true);
  }

  async function handleStopSimulationButtonClick() {
    if (!isRunning && !isPaused) {
      return;
    }
    await postSimulationStopRequest();
    setIsRunning(false);
    setIsPaused(false);
  }

  function handleFastForwardSelect(event) {
    let speed = Number(event.target.value);
    setFastForwardSpeed(speed);
  }

  function handleVehicleInFlowInputChange(event) {
    let inFlow = Number(event.target.value);
    setVehicleInFlow(inFlow);
  }

  function handleVehicleInFlowInputValidation() {
    if (vehicleInFlow > maxInFlow) {
      setVehicleInFlow(maxInFlow);
    }
    else if (vehicleInFlow < minInFlow ) {
      setVehicleInFlow(minInFlow);
    }

  }

  // Build Mode Controls
  useEffect(() => {
    if (selectedTrafficSignal != null) {
      if (selectedTrafficSignal.junctionId !== null) {
        let junctionId = selectedTrafficSignal.junctionId;
        let selectedJunctionTrafficSignalList = [];
        selectedJunctionTrafficSignalList.push(selectedTrafficSignal);
        trafficSignalList.forEach((trafficSignal) => {
          if (
            trafficSignal.name !== selectedTrafficSignal.name &&
            trafficSignal.junctionId === junctionId
          ) {
            selectedJunctionTrafficSignalList.push(trafficSignal);
          }
        });

        selectedJunctionTrafficSignalList.sort(function (a, b) {
          return a.sequence - b.sequence;
        });
        setSelectedJunctionTrafficSignalList(selectedJunctionTrafficSignalList);
      }
    }
  }, [selectedTrafficSignal, trafficSignalList]);

  function handleChangeMode() {
    if (selectedTrafficSignal != null) {
      if (selectedTrafficSignal.junctionId == null) {
        setIsShowingAlertModal(true);
        return;
      }
    }

    if (mode === "build") {
      setSelectedTrafficSignal(null);
      setSelectedJunctionTrafficSignalList([]);
      setActivatedBuildComponent("");
      setInformationComponentCategory(null);
      setSelectedTrafficSignalDuration(null);
      setSelectedRoad(null);
      setSelectedRoadNode(null);
    } else if (mode === "simulation") {
      setIsRunning(false);
      setIsPaused(false);
    }

    setMode(mode === "build" ? "simulation" : "build");
  }

  async function handleResetButtonClick() {
    await fetchRoadResetData();
    await fetchTrafficSignalResetData();
    setSelectedRoad();
    setSelectedRoadNode();
    setSelectedTrafficSignal();
    setSelectedJunctionTrafficSignalList([]);
  }

  function handleActivatedBuildComponentButtonClick(event) {
    if (selectedTrafficSignal != null) {
      if (selectedTrafficSignal.junctionId == null) {
        console.log("here");
        setIsShowingAlertModal(true);
        return;
      }
    }

    let component = event.currentTarget.getAttribute("data-component-type");
    if (component === activatedBuildComponent) {
      setActivatedBuildComponent("");
    } else {
      setActivatedBuildComponent(component);
    }
    setSelectedRoad();
    setSelectedRoadNode();
    setSelectedTrafficSignal();
    setSelectedTrafficSignalDuration();
    setActivatedAddComponent();
  }

  function handleActivatedAddComponentButtonClick(event) {
    if (selectedTrafficSignal != null) {
      if (selectedTrafficSignal.junctionId == null) {
        console.log("here");
        setIsShowingAlertModal(true);
        return;
      }
    }

    let component = event.currentTarget.getAttribute("data-component-type");

    if (component === activatedAddComponent) {
      setActivatedAddComponent("");
      setSelectedRoad();
      setSelectedRoadNode();
      setSelectedTrafficSignal();
      setSelectedTrafficSignalDuration();
    } else {
      setActivatedAddComponent(component);
    }
  }

  function handleTrafficSignalDurationInputChange(event) {
    let duration = Number(event.target.value);
    let updatedTrafficSignalList = [...trafficSignalList];
    updatedTrafficSignalList.forEach((trafficSignal) => {
      if (trafficSignal.name === selectedTrafficSignal.name) {
        trafficSignal.duration = duration;
      }
    });
    setSelectedTrafficSignalDuration(duration);
  }

  function handleTrafficSignalInformationDeleteButtonClick() {
    if (informationComponentCategory === "Traffic Signal") {
      let updatedTrafficSignalList = [...trafficSignalList];
      let deleteIndex;
      updatedTrafficSignalList.forEach((trafficSignal, index) => {
        if (trafficSignal.name === selectedTrafficSignal.name) {
          deleteIndex = index;
        }
      });
      updatedTrafficSignalList.splice(deleteIndex, 1);
      setTrafficSignalList(updatedTrafficSignalList);
      setSelectedTrafficSignal(null);
      setSelectedJunctionTrafficSignalList([]);
    } else if (informationComponentCategory === "Junction") {
      let deleteJunctionId = selectedTrafficSignal.junctionId;
      let updatedJunctionList = [...junctionList];
      let updatedTrafficSignalList = [...trafficSignalList];
      let deleteIndex;

      updatedJunctionList.forEach((junction, index) => {
        if (junction === deleteJunctionId) {
          deleteIndex = index;
        }
      });

      let trafficSignalDeleteIndex = [];
      updatedTrafficSignalList.forEach((trafficSignal, index) => {
        if (trafficSignal.junctionId === deleteJunctionId) {
          trafficSignalDeleteIndex.push(index);
        }
      });

      while (trafficSignalDeleteIndex.length > 0) {
        let index = trafficSignalDeleteIndex.pop();
        updatedTrafficSignalList.splice(index, 1);
      }

      setTrafficSignalList(updatedTrafficSignalList);
      updatedJunctionList.splice(deleteIndex, 1);
      setJunctionList(updatedJunctionList);
      setSelectedJunctionTrafficSignalList([]);
      setSelectedTrafficSignal();
    }
  }

  function handleTrafficSignalInformationCloseButtonClick() {
    if (selectedTrafficSignal != null) {
      if (selectedTrafficSignal.junctionId == null) {
        console.log("here");
        setIsShowingAlertModal(true);
        return;
      }
    }

    setSelectedTrafficSignal(null);
    setSelectedJunctionTrafficSignalList([]);
  }

  function handleJunctionTrafficSignalListClick(event) {
    let newObject = selectedJunctionTrafficSignalList[event.currentTarget.getAttribute("data-key")];
    // newObject.type = "Traffic Signal";
    setSelectedTrafficSignal(newObject);
    setInformationComponentCategory("Traffic Signal");
  }

  function handleJunctionSequenceReorderClick(event) {
    let currentIndex = Number(event.currentTarget.getAttribute("data-key"));
    let object = selectedJunctionTrafficSignalList[currentIndex];
    let newIndex;
    let swapObject;

    if (event.currentTarget.getAttribute("data-order") === "up") {
      if (currentIndex === 0) {
        return;
      }

      newIndex = Number(currentIndex) - 1;
    } else {
      if (currentIndex === selectedJunctionTrafficSignalList.length - 1) {
        return;
      }

      newIndex = Number(currentIndex) + 1;
    }

    swapObject = selectedJunctionTrafficSignalList[newIndex];

    let updatedTrafficSignalList = [...trafficSignalList];
    updatedTrafficSignalList.forEach((trafficSignal) => {
      if (trafficSignal.name === object.name) {
        trafficSignal.sequence = newIndex;
      } else if (trafficSignal.name === swapObject.name) {
        trafficSignal.sequence = currentIndex;
      }
    });

    setTrafficSignalList(updatedTrafficSignalList);
  }

  function handleTrafficSignalJunctionListSelect(event) {
    let updatedTrafficSignalList = [...trafficSignalList];
    updatedTrafficSignalList.forEach((trafficSignal) => {
      if (trafficSignal.name === selectedTrafficSignal.name) {
        trafficSignal.junctionId = Number(event.currentTarget.value);
        let updatedSelectedJunctionTrafficSignalList = [...selectedJunctionTrafficSignalList];
        updatedSelectedJunctionTrafficSignalList.push(trafficSignal.name);
        trafficSignal.sequence = updatedSelectedJunctionTrafficSignalList.length - 1;
        setSelectedJunctionTrafficSignalList(updatedSelectedJunctionTrafficSignalList);
      }
    });
    setTrafficSignalList(updatedTrafficSignalList);
  }

  function handleNewTrafficSignalToJunctionButtonClick() {
    let newJunction = junctionList.length;
    let updatedJunctionList = [...junctionList];
    updatedJunctionList.push(newJunction);
    selectedTrafficSignal.junctionId = newJunction;

    let updatedTrafficSignalList = [...trafficSignalList];
    updatedTrafficSignalList.forEach((trafficSignal) => {
      if (trafficSignal.name === selectedTrafficSignal.name) {
        trafficSignal.junctionId = newJunction;
        trafficSignal.sequence = 0;
        setSelectedJunctionTrafficSignalList([trafficSignal.name]);
      }
    });
    setJunctionList(updatedJunctionList);
  }

  function handleRoadInformationDeleteButtonClick() {
    let updatedRoadList = [...roadList];

    if (informationComponentCategory === "Road Node") {
      updatedRoadList.forEach((road) => {
        if (road.id === selectedRoad.id) {
          let index = 0;
          road.node.forEach((roadNode) => {
            if (
              roadNode.xCoordinate === selectedRoadNode.xCoordinate &&
              roadNode.yCoordinate === selectedRoadNode.yCoordinate
            ) {
              road.node.splice(index, 1);
            }
            index++;
          });
        }
      });
    } else if (informationComponentCategory === "Road") {
      let index = 0;
      updatedRoadList.forEach((road) => {
        if (road.id === selectedRoad.id) {
          updatedRoadList.splice(index, 1);
        }
        index++;
      });
    }

    setRoadList(updatedRoadList);
    setSelectedRoadNode();
    setSelectedRoad();
    setInformationComponentCategory();
  }

  function handleRoadCloseButtonClick() {
    setSelectedRoad();
    setSelectedRoadNode();
  }

  function handleRoadRoadNodeListClick(event) {
    let index = event.currentTarget.getAttribute("data-key");
    setSelectedRoadNode(selectedRoad.node[index]);
  }

  function handleRoadNodeSequenceReorderClick(event) {
    let currentIndex = Number(event.currentTarget.getAttribute("data-key"));
    let object = selectedRoad.node[currentIndex];
    let newIndex;
    let swapObject;

    if (event.currentTarget.getAttribute("data-order") === "up") {
      if (currentIndex === 0) {
        return;
      }

      newIndex = Number(currentIndex) - 1;
    } else {
      if (currentIndex === selectedRoad.node.length - 1) {
        return;
      }

      newIndex = Number(currentIndex) + 1;
    }

    swapObject = selectedRoad.node[newIndex];

    let updatedRoadList = [...roadList];
    updatedRoadList.forEach((road) => {
      if (road.id === selectedRoad.id) {
        if (currentIndex > newIndex) {
          let currentRoadNode = road.node[currentIndex];
          road.node.splice(currentIndex, 1);
          road.node.splice(newIndex, 0, currentRoadNode);
        } else {
          let currentRoadNode = road.node[newIndex];
          road.node.splice(newIndex, 1);
          road.node.splice(currentIndex, 0, currentRoadNode);
        }
      }
    });

    setRoadList(updatedRoadList);
  }

  function handleRoadNodeXCoordinateInputChange(event) {
    let newCoordinate = Number(event.target.value);
    let updatedRoadList = [...roadList];
    updatedRoadList.forEach((road) => {
      if (road.id === selectedRoad.id) {
        road.node.forEach((roadNode) => {
          if (roadNode.roadNodeId === selectedRoadNode.roadNodeId) {
            roadNode.xCoordinate = newCoordinate;
          }
        });
      }
    });
    setRoadList(updatedRoadList);
  }

  function handleRoadNodeXCoordinateInputValidation() {
    if (selectedRoadNode.xCoordinate > 180) {
      let updatedRoadList = [...roadList];
    updatedRoadList.forEach((road) => {
      if (road.id === selectedRoad.id) {
        road.node.forEach((roadNode) => {
          if (roadNode.roadNodeId === selectedRoadNode.roadNodeId) {
            roadNode.xCoordinate = 180;
          }
        });
      }
    });
    setRoadList(updatedRoadList);
    }
    else if (selectedRoadNode.xCoordinate < -180) {
      let updatedRoadList = [...roadList];
    updatedRoadList.forEach((road) => {
      if (road.id === selectedRoad.id) {
        road.node.forEach((roadNode) => {
          if (roadNode.roadNodeId === selectedRoadNode.roadNodeId) {
            roadNode.xCoordinate = -180;
          }
        });
      }
    });
    setRoadList(updatedRoadList);
    }
  }

  function handleRoadNodeYCoordinateInputChange(event) {
    let newCoordinate = Number(event.target.value);
    let updatedRoadList = [...roadList];
    updatedRoadList.forEach((road) => {
      if (road.id === selectedRoad.id) {
        road.node.forEach((roadNode) => {
          if (roadNode.roadNodeId === selectedRoadNode.roadNodeId) {
            roadNode.yCoordinate = newCoordinate;
          }
        });
      }
    });
    setRoadList(updatedRoadList);
  }

  function handleRoadNodeYCoordinateInputValidation() {
    if (selectedRoadNode.yCoordinate > 90) {
      let updatedRoadList = [...roadList];
    updatedRoadList.forEach((road) => {
      if (road.id === selectedRoad.id) {
        road.node.forEach((roadNode) => {
          if (roadNode.roadNodeId === selectedRoadNode.roadNodeId) {
            roadNode.yCoordinate = 90;
          }
        });
      }
    });
    setRoadList(updatedRoadList);
    }
    else if (selectedRoadNode.yCoordinate < -90) {
      let updatedRoadList = [...roadList];
    updatedRoadList.forEach((road) => {
      if (road.id === selectedRoad.id) {
        road.node.forEach((roadNode) => {
          if (roadNode.roadNodeId === selectedRoadNode.roadNodeId) {
            roadNode.yCoordinate = -90;
          }
        });
      }
    });
    setRoadList(updatedRoadList);
    }
  }

  function handleRoadIsOneWayCheckboxInputChange(event) {
    let updatedRoadList = [...roadList];
    updatedRoadList.forEach((road) => {
      if (road.roadId === selectedRoad.roadId) {
        road.isOneWay = event.target.checked;
      }
    });

    setRoadList(updatedRoadList);
  }

  function handleCloseModalButtonClick() {
    setIsShowingAlertModal(false);
  }

  // Canvas Click Event Handlers
  const AddTrafficSignalClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (
          activatedBuildComponent === "traffic-signal" &&
          activatedAddComponent === "traffic-signal"
        ) {
          const { lat, lng } = e.latlng;
          let closestRoadNode = isValidTrafficSignalPosition(lat, lng);

          if (closestRoadNode === null) {
            return;
          }

          let newName = "Traffic Signal " + trafficSignalList.length;
          let newTrafficSignal = {
            name: newName,
            junctionId: null,
            duration: 30,
            sequence: null,
            isActive: false,
            xCoordinate: closestRoadNode.xCoordinate,
            yCoordinate: closestRoadNode.yCoordinate,
          };
          let updatedTrafficSignalList = [...trafficSignalList];
          updatedTrafficSignalList.push(newTrafficSignal);
          setTrafficSignalList(updatedTrafficSignalList);

          let trafficSignalObject = newTrafficSignal;
          trafficSignalObject.type = "Traffic Signal";
          setSelectedTrafficSignal(trafficSignalObject);
          setInformationComponentCategory("Traffic Signal");
          setSelectedTrafficSignalDuration(newTrafficSignal.duration);
        }
      },
    });

    function isValidTrafficSignalPosition(lat, lng) {
      const tolerance = 0.0001;
      let closestNode = null;
      let minDistance = Infinity;

      roadList.forEach((road) => {
        road.node.forEach((roadNode) => {
          const distance = Math.sqrt(
            Math.pow(roadNode.yCoordinate - lat, 2) + Math.pow(roadNode.xCoordinate - lng, 2)
          );
          if (distance <= tolerance && distance < minDistance) {
            minDistance = distance;
            closestNode = roadNode;
          }
        });
      });

      return closestNode;
    }
  };

  const ClickRoadHandler = (e) => {
    const canvas = canvasRoadRef.current;
    if (!canvas) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clickPoint = canvas._map.containerPointToLatLng([x, y]);

    let minDistance = Infinity;
    let closestRoad = null;
    let tolerance = 0.0001;

    roadList.forEach((road) => {
      const roadNodeList = road.node;
      for (let i = 0; i < roadNodeList.length - 1; i++) {
        const startNode = {
          lat: roadNodeList[i].yCoordinate,
          lng: roadNodeList[i].xCoordinate,
        };
        const endNode = {
          lat: roadNodeList[i + 1].yCoordinate,
          lng: roadNodeList[i + 1].xCoordinate,
        };

        const startEndDistance = Math.sqrt(
          Math.pow(startNode.lat - endNode.lat, 2) + Math.pow(startNode.lng - endNode.lng, 2)
        );
        const startClickDistance = Math.sqrt(
          Math.pow(startNode.lat - clickPoint.lat, 2) + Math.pow(startNode.lng - clickPoint.lng, 2)
        );
        const endClickDistance = Math.sqrt(
          Math.pow(clickPoint.lat - endNode.lat, 2) + Math.pow(clickPoint.lng - endNode.lng, 2)
        );
        const difference = startClickDistance + endClickDistance;

        if (Math.abs(startEndDistance - difference) < tolerance) {
          if (minDistance > startEndDistance - difference) {
            minDistance = startEndDistance - difference;
            closestRoad = road;
          }
        }
      }
    });

    if (closestRoad == null) {
      setSelectedRoad(null);
      setSelectedRoadNode(null);
      setInformationComponentCategory("");
    } else {
      setSelectedRoad(closestRoad);
      setSelectedRoadNode(closestRoad.node[0]);
      setInformationComponentCategory("Road");
    }
  };

  const AddRoadHandler = (e) => {
    const canvas = canvasRoadRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clickPoint = canvas._map.containerPointToLatLng([x, y]);

    let newRoadNode = { xCoordinate: clickPoint.lng, yCoordinate: clickPoint.lat };

    if (selectedRoad == null) {
      newRoadNode.roadNodeId = 0;
      let newRoad = {
        id: roadList[roadList.length - 1].id + 1,
        name: "road_" + (Number(roadList[roadList.length - 1].name.substring(5)) + 1),
        isOneWay: false,
        node: [newRoadNode],
      };
      let updatedRoadList = [...roadList];
      updatedRoadList.push(newRoad);
      setRoadList(updatedRoadList);
      setSelectedRoad(newRoad);
      setSelectedRoadNode(newRoadNode);
      setInformationComponentCategory("Road");
    } else {
      let updatedRoadList = [...roadList];
      updatedRoadList.forEach((road) => {
        if (road.id === selectedRoad.id) {
          let updatedRoadNodeList = [...road.node];
          newRoadNode.roadNodeId = updatedRoadNodeList.length;
          updatedRoadNodeList.push(newRoadNode);
          road.node = updatedRoadNodeList;
        }
      });
      setRoadList(updatedRoadList);
      setSelectedRoadNode(newRoadNode);
      setInformationComponentCategory("Road");
    }
  };

  return (
    <div className="w-full h-full flex">
      <div
        className="w-fit h-[3rem] absolute flex items-center top-10 left-10 bg-[#94BCC2] rounded-xl px-5 py-2 z-[20] cursor-pointer"
        onClick={handleChangeMode}>
        <div className="h-full w-fit mr-3 text-white flex justify-center items-center">
          {mode === "build" ? <CustomiseIcon /> : <VehicleIcon />}
        </div>
        <span className="text-white text-2xl">
          {mode === "build" ? "Build Mode" : "Simulation Mode"}
        </span>
      </div>

      {/* Build Mode Section */}
      {mode === "build" ? (
        <div className="w-fit h-fit">
          <div className="w-fit h-fit absolute top-24 left-10 flex flex-col items-center bg-[#94BCC2] rounded-xl px-3 py-3 z-[20]">
            <div
              className={`h-[3rem] text-white cursor-pointer p-2 ${
                activatedBuildComponent === "traffic-signal" ? "bg-[#4692B4] rounded-xl" : ""
              }`}
              data-component-type="traffic-signal"
              onClick={handleActivatedBuildComponentButtonClick}>
              <TrafficSignalIcon />
            </div>
            <div
              className={`h-[3rem] text-white cursor-pointer p-2 mt-1 ${
                activatedBuildComponent === "road" ? "bg-[#4692B4] rounded-xl" : ""
              }`}
              data-component-type="road"
              onClick={handleActivatedBuildComponentButtonClick}>
              <RoadIcon />
            </div>
          </div>
          <div
            className={`w-[8.5rem] h-fit absolute top-24 left-10 flex justify-end bg-[#94BCC2] rounded-xl px-3 py-3 z-[15] ${
              activatedBuildComponent !== "traffic-signal" ? "hidden" : ""
            }`}>
            <div
              className={`h-[3rem] text-white cursor-pointer p-2 ${
                activatedAddComponent === "traffic-signal" ? "bg-[#4692B4] rounded-xl" : ""
              }`}
              data-component-type="traffic-signal"
              onClick={handleActivatedAddComponentButtonClick}>
              <AddIcon />
            </div>
          </div>
          <div
            className={`w-[8.5rem] h-fit absolute top-[9.3rem] left-10 flex justify-end bg-[#94BCC2] rounded-xl px-3 py-3 z-[15] ${
              activatedBuildComponent !== "road" ? "hidden" : ""
            }`}>
            <div
              className={`h-[3rem] text-white cursor-pointer p-2 ${
                activatedAddComponent === "road" ? "bg-[#4692B4] rounded-xl" : ""
              }`}
              data-component-type="road"
              onClick={handleActivatedAddComponentButtonClick}>
              <AddIcon />
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {/* Reset Button */}
      {mode === "build" ? (
        <div
          className="w-fit h-[3rem] absolute flex items-center top-10 right-10 bg-[#94BCC2] rounded-xl px-5 py-2 z-[20] cursor-pointer"
          onClick={handleResetButtonClick}>
          <div className="h-full w-fit mr-3 text-white flex justify-center items-center">
            <ResetIcon />
          </div>
          <span className="text-white text-2xl">Reset</span>
        </div>
      ) : (
        <></>
      )}

      {/* Component Information Section */}
      {mode === "build" && selectedTrafficSignal != null ? (
        <div className="w-[25%] h-fit absolute bg-[#94BCC2] left-10 bottom-10 rounded-xl z-[20] flex flex-col items-center px-10 py-5">
          <div className="w-fit bg-gray-200 rounded-xl flex justify-center items-center px-1 py-1">
            <div
              className={`${
                informationComponentCategory === "Traffic Signal"
                  ? "bg-[#94BCC2] px-3 py-1 rounded-lg"
                  : "cursor-pointer"
              } text-xl mx-2`}
              onClick={() => {
                setInformationComponentCategory("Traffic Signal");
              }}>
              Traffic Signal
            </div>
            <div
              className={`${
                informationComponentCategory === "Junction"
                  ? "bg-[#94BCC2] px-3 py-1 rounded-lg"
                  : "cursor-pointer"
              } text-xl mx-2`}
              onClick={() => {
                selectedTrafficSignal.junctionId !== null
                  ? setInformationComponentCategory("Junction")
                  : setInformationComponentCategory(informationComponentCategory);
              }}>
              Junction
            </div>
          </div>
          {informationComponentCategory === "Traffic Signal" ? (
            <div className="w-full">
              <div className="w-full h-fit flex flex-col mt-5">
                <span className="text-lg font-bold">Name</span>
                <span className="w-full bg-gray-200 rounded-sm mt-1 text-md px-3 py-1">
                  {selectedTrafficSignal.name}
                </span>
              </div>
              <div className="w-full h-fit flex flex-col mt-5">
                <span className="text-lg font-bold">Junction ID</span>
                <div className="w-full flex justify-between">
                  <select
                    className="w-[65%] h-fit bg-gray-200 rounded-sm mt-1 text-md px-3 py-1"
                    value={
                      selectedTrafficSignal.junctionId == null
                        ? ""
                        : selectedTrafficSignal.junctionId
                    }
                    onChange={handleTrafficSignalJunctionListSelect}>
                    {junctionList.map((junction) => (
                      <option key={junction} value={junction}>
                        {junction}
                      </option>
                    ))}
                    {selectedTrafficSignal.junctionId == null ? (
                      <option key={""} value={""}></option>
                    ) : (
                      <></>
                    )}
                  </select>
                  <button
                    className="w-[30%] bg-gray-200 rounded-sm mt-1 px-2 py-1 text-sm"
                    onClick={handleNewTrafficSignalToJunctionButtonClick}>
                    New
                  </button>
                </div>
              </div>
              <div className="w-full h-fit flex flex-col mt-5">
                <span className="text-lg font-bold">Green Light Duration (seconds)</span>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-gray-200 rounded-sm mt-1 text-md px-3 py-1 focus:outline-none"
                  value={selectedTrafficSignalDuration}
                  onChange={handleTrafficSignalDurationInputChange}
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-fit flex flex-col">
              <div className="w-full h-fit flex flex-col mt-5">
                <span className="text-lg font-bold">Junction ID</span>
                <span className="w-full bg-gray-200 rounded-sm mt-1 text-md px-3 py-1">
                  {selectedTrafficSignal.junctionId}
                </span>
              </div>
              <div className="w-full h-fit flex flex-col mt-5">
                <span className="text-lg font-bold">Sequence</span>
                <div className="w-full">
                  {selectedJunctionTrafficSignalList.length > 0 ? (
                    selectedJunctionTrafficSignalList.map((trafficSignal, index) => (
                      <div
                        key={index}
                        className={`w-full px-2 py-1 flex justify-between items-center my-2 cursor-pointer ${
                          trafficSignal.name === selectedTrafficSignal.name
                            ? "bg-[#4692B4] text-white"
                            : "bg-gray-200"
                        }`}>
                        <span
                          className="w-[75%]"
                          key={index}
                          data-key={index}
                          onClick={handleJunctionTrafficSignalListClick}>
                          {trafficSignal.name}
                        </span>
                        <div className="w-[20%] flex justify-between">
                          <div
                            className={`w-[40%] ${
                              index === 0 ? "text-gray-400" : "text-black cursor-pointer"
                            }`}
                            data-key={index}
                            data-order={"up"}
                            onClick={handleJunctionSequenceReorderClick}>
                            <UpIcon />
                          </div>
                          <div
                            className={`w-[40%] ${
                              index === selectedJunctionTrafficSignalList.length - 1
                                ? "text-gray-400"
                                : "text-black cursor-pointer"
                            }`}
                            data-key={index}
                            data-order={"down"}
                            onClick={handleJunctionSequenceReorderClick}>
                            <DownIcon />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="w-full h-fit flex justify-between mt-10">
            <button
              className="w-[45%] bg-red-200 rounded px-2 py-1"
              onClick={handleTrafficSignalInformationDeleteButtonClick}>
              Delete
            </button>
            <button
              className="w-[45%] bg-gray-200 rounded px-2 py-1"
              onClick={handleTrafficSignalInformationCloseButtonClick}>
              Close
            </button>
          </div>
        </div>
      ) : mode === "build" && selectedRoad != null ? (
        <div className="w-[25%] h-fit absolute bg-[#94BCC2] left-10 bottom-10 rounded-xl z-[20] flex flex-col items-center px-10 py-5">
          <div className="w-fit bg-gray-200 rounded-xl flex justify-center items-center px-1 py-1">
            <div
              className={`${
                informationComponentCategory === "Road Node"
                  ? "bg-[#94BCC2] px-3 py-1 rounded-lg"
                  : "cursor-pointer"
              } text-xl mx-2`}
              onClick={() => {
                setInformationComponentCategory("Road Node");
              }}>
              Road Node
            </div>
            <div
              className={`${
                informationComponentCategory === "Road"
                  ? "bg-[#94BCC2] px-3 py-1 rounded-lg"
                  : "cursor-pointer"
              } text-xl mx-2`}
              onClick={() => {
                selectedRoad !== null
                  ? setInformationComponentCategory("Road")
                  : setInformationComponentCategory(informationComponentCategory);
              }}>
              Road
            </div>
          </div>
          {informationComponentCategory === "Road Node" ? (
            <div className="w-full">
              <div className="w-full h-fit flex flex-col mt-5">
                <span className="text-lg font-bold">X Coordinate</span>
                <input
                  type="number"
                  min="-180"
                  max="180"
                  step="0.0000001"
                  className="w-full bg-gray-200 rounded-sm mt-1 text-md px-3 py-1 focus:outline-none"
                  value={selectedRoadNode.xCoordinate}
                  onBlur={handleRoadNodeXCoordinateInputValidation}
                  onChange={handleRoadNodeXCoordinateInputChange}
                />
              </div>
              <div className="w-full h-fit flex flex-col mt-5">
                <span className="text-lg font-bold">Y Coordinate</span>
                <input
                  type="number"
                  min="-90"
                  max="90"
                  step="0.0000001"
                  className="w-full bg-gray-200 rounded-sm mt-1 text-md px-3 py-1 focus:outline-none"
                  value={selectedRoadNode.yCoordinate}
                  onBlur={handleRoadNodeYCoordinateInputValidation}
                  onChange={handleRoadNodeYCoordinateInputChange}
                />
              </div>
              <div className="w-full h-fit flex flex-col mt-5">
                <span className="text-lg font-bold">Road ID</span>
                <span className="w-full bg-gray-200 rounded-sm mt-1 text-md px-3 py-1">
                  {selectedRoad.id}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full max-h-[50%] flex flex-col overflow-auto">
              <div className="w-full h-fit flex flex-col mt-5">
                <span className="text-lg font-bold">Road ID</span>
                <span className="w-full bg-gray-200 rounded-sm mt-1 text-md px-3 py-1">
                  {selectedRoad.id}
                </span>
              </div>
              <div className="w-full h-fit flex mt-5 justify-between items-center">
                <span className="text-lg font-bold">One-Way Street</span>
                <input
                  type="checkbox"
                  checked={selectedRoad.isOneWay}
                  onChange={handleRoadIsOneWayCheckboxInputChange}
                />
              </div>
              <div className="w-full h-fit flex flex-col mt-5">
                <span className="text-lg font-bold">Road Node List</span>
                <div className="w-full max-h-[10rem] overflow-auto">
                  {selectedRoad.node.length > 0 ? (
                    selectedRoad.node.map((roadNode, index) => (
                      <div
                        key={index}
                        className={`w-full px-2 py-1 flex justify-between items-center my-2 cursor-pointer ${
                          selectedRoadNode != null &&
                          roadNode.roadNodeId === selectedRoadNode.roadNodeId
                            ? "bg-[#4692B4] text-white"
                            : "bg-gray-200"
                        }`}>
                        <span
                          className="w-[75%]"
                          key={index}
                          data-key={index}
                          onClick={handleRoadRoadNodeListClick}>
                          {"Road Node [" + roadNode.xCoordinate + ", " + roadNode.yCoordinate + "]"}
                        </span>
                        <div className="w-[20%] flex justify-between">
                          <div
                            className={`w-[40%] ${
                              index === 0
                                ? "text-gray-400"
                                : selectedRoadNode != null &&
                                  roadNode.roadNodeId === selectedRoadNode.roadNodeId
                                ? "text-white cursor-pointer"
                                : "text-black cursor-pointer"
                            }`}
                            data-key={index}
                            data-order={"up"}
                            onClick={handleRoadNodeSequenceReorderClick}>
                            <UpIcon />
                          </div>
                          <div
                            className={`w-[40%] ${
                              index === selectedRoad.node.length - 1
                                ? "text-gray-400"
                                : selectedRoadNode != null &&
                                  roadNode.roadNodeId === selectedRoadNode.roadNodeId
                                ? "text-white cursor-pointer"
                                : "text-black cursor-pointer"
                            }`}
                            data-key={index}
                            data-order={"down"}
                            onClick={handleRoadNodeSequenceReorderClick}>
                            <DownIcon />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="w-full h-fit flex justify-between mt-10">
            <button
              className="w-[45%] bg-red-200 rounded px-2 py-1"
              onClick={handleRoadInformationDeleteButtonClick}>
              Delete
            </button>
            <button
              className="w-[45%] bg-gray-200 rounded px-2 py-1"
              onClick={handleRoadCloseButtonClick}>
              Close
            </button>
          </div>
        </div>
      ) : (
        <></>
      )}

      {/* Simulation Control Information Section */}
      {mode === "simulation" && !isRunning && !isPaused ? (
        <div className="w-[25%] h-fit absolute bg-[#94BCC2] left-10 bottom-10 rounded-xl z-[20] flex flex-col items-center px-10 py-5">
          <div className="w-full h-fit flex flex-col">
            <span className="text-xl font-bold">Simulation Speed</span>
            <div className="flex justify-between items-center mt-2">
              <span className="w-[60%] text-lg font-semibold">Fast Forward</span>
              <select
                className="w-[35%] bg-gray-200 rounded-sm mt-1 text-right text-md px-3 py-1 focus:outline-none"
                value={fastForwardSpeed}
                onChange={handleFastForwardSelect}>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={5}>5x</option>
              </select>
            </div>
            <span className="text-sm mt-2">
              1 second in real time = {fastForwardSpeed} second(s) in the simulation
            </span>
          </div>
          <div className="w-full h-fit flex flex-col mt-5">
            <span className="text-xl font-bold">Traffic Flow</span>
            <div className="flex justify-between items-center mt-2">
              <span className="w-[60%] text-lg font-semibold">Vehicle In-Flow (veh/h)</span>
              <input
                className="w-[35%] bg-gray-200 rounded-sm mt-1 text-right text-md px-3 py-1 focus:outline-none"
                min={minInFlow}
                max={maxInFlow}
                type="number"
                value={vehicleInFlow}
                onBlur={handleVehicleInFlowInputValidation}
                onChange={handleVehicleInFlowInputChange}
              />
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}

      {/* Simulation Control Panel */}
      <div
        className={`flex justify-center absolute left-[35%] right-[35%] bottom-10 z-[20] ${
          mode === "simulation" ? "" : "hidden"
        }`}>
        <button
          className={`w-[4rem] h-[4rem] border border-black text-center text-white flex p-3 ${
            isRunning && !isPaused ? "bg-gray-500" : "bg-[#94BCC2]"
          }`}
          onClick={handleStartSimulationButtonClick}>
          <PlayIcon />
        </button>
        <button
          className={`w-[4rem] h-[4rem] border border-black text-center text-white flex p-3 ${
            isRunning && !isPaused ? "bg-[#94BCC2]" : "bg-gray-500"
          }`}
          onClick={handlePauseSimulationButtonClick}>
          <PauseIcon />
        </button>
        <button
          className={`w-[4rem] h-[4rem] border border-black text-center text-white flex p-3 ${
            isRunning || isPaused ? "bg-[#94BCC2]" : "bg-gray-500"
          }`}
          onClick={handleStopSimulationButtonClick}>
          <StopIcon />
        </button>
      </div>

      {/* Map */}
      <div className="w-full h-full relative">
        <MapContainer
          center={[3.063647, 101.702397]}
          zoom={15}
          scrollWheelZoom={true}
          zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="bottomright" />
          <CanvasOverlay canvasRef={canvasRoadRef} draw={drawRoadPolylines} />
          {mode === "simulation" && (isRunning || isPaused) ? (
            <CanvasOverlay canvasRef={canvasVehicleRef} draw={drawVehicleMarkers} />
          ) : (
            <></>
          )}
          {mode === "build" ? (
            <TrafficSignalMarkers />
          ) : isRunning || isPaused ? (
            <CanvasOverlay canvasRef={canvasTrafficSignalRef} draw={drawTrafficSignalMarkers} />
          ) : (
            <></>
          )}
          {mode === "build" &&
          ((activatedBuildComponent === "traffic-signal" &&
            activatedAddComponent === "traffic-signal") ||
            activatedBuildComponent === "road") ? (
            <CanvasOverlay canvasRef={canvasRoadNodeRef} draw={drawRoadNodeMarkers} />
          ) : (
            <></>
          )}
          {mode === "build" && activatedBuildComponent === "traffic-signal" ? (
            <AddTrafficSignalClickHandler />
          ) : (
            <></>
          )}
        </MapContainer>
      </div>

      {/* Error Validation Modal */}
      <div
        className={`w-full h-full absolute flex justify-center items-center z-[2000] ${
          isShowingAlertModal ? "" : "hidden"
        }`}>
        <div className="w-full h-full absolute bg-gray-700 opacity-60"></div>
        <div className="w-1/3 h-fit bg-white rounded-lg z-[2500] px-5 py-3 flex flex-col">
          <span className="text-black text-xl font-bold">
            Incomplete Traffic Signal Configuration
          </span>
          <span className="w-full h-fit mt-5">
            All traffic signals need to be configured with a junction. Please assign a junction to
            the selected traffic signal or create a new one.
          </span>
          <div className="w-full mt-10 flex justify-end items-center">
            <button
              className="w-[45%] bg-[#94BCC2] rounded px-2 py-1 text-white"
              onClick={handleCloseModalButtonClick}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
