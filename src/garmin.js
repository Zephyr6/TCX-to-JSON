import { fromXML } from "from-xml";
import moment from "moment-timezone";
import { pathOr, compose, isNil, unless, and, path } from "ramda";

export function parseDate(date) {
  return moment(date).tz("America/Denver");
}

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

//#region Ramda Functions
const getNumber = unless(isNil, Number);
// prettier-ignore
const getBPM = compose(
    getNumber, 
    pathOr(null, ["HeartRateBpm", "Value"])
  );
// prettier-ignore
const getCadence = compose(
    getNumber, 
    pathOr(null, ["Cadence"])
  );
const getSpeed = compose(
  getNumber,
  pathOr(null, ["Extensions", "ns3:TPX", "ns3:Speed"])
);
// prettier-ignore
const hasPosition = and(
  path(["Position", "LatitudeDegrees"]),
  path(["Position", "LongitudeDegrees"])
)
const getLatitude = compose(Number, path(["Position", "LatitudeDegrees"]));
const getLongitude = compose(Number, path(["Position", "LongitudeDegrees"]));
//#endregion

function parseTrack(point, callback) {
  const BPM = getBPM(point);
  const cadence = getCadence(point);
  const speed = getSpeed(point);

  let position = null;
  if (hasPosition(point)) {
    position = {
      latitude: getLatitude(point),
      longitude: getLongitude(point)
    };
  }

  const newPoint = {
    time: parseDate(point.Time),
    altitudeMeters: Number(point.AltitudeMeters),
    distanceMeters: Number(point.DistanceMeters),
    BPM,
    cadence,
    speed,
    position
  };

  callback && callback(newPoint);

  return newPoint;
}

function parseLap(lap, callback, trackCallback) {
  const track = lap.Track.Trackpoint.map(point =>
    parseTrack(point, trackCallback)
  );

  const totalSeconds = Number(lap.TotalTimeSeconds);
  const totalMeters = Number(lap.DistanceMeters);
  const calories = Number(lap.Calories);

  const newLap = {
    averageBPM: Number(lap.AverageHeartRateBpm.Value),
    cadence: getCadence(lap),
    calories,
    maxBPM: Number(lap.MaximumHeartRateBpm.Value),
    maxSpeed: lap.MaximumSpeed,
    startTime: parseDate(lap["@StartTime"]),
    totalMeters,
    totalSeconds,
    track
  };

  callback && callback(newLap);

  return newLap;
}

function parse(xml) {
  const data = fromXML(xml).TrainingCenterDatabase.Activities.Activity;

  let totalActivitySeconds = 0,
    totalActivityMeters = 0,
    totalActivityCalories = 0,
    totalActivityTrack = [],
    maxCadence = 0,
    totalCadenceAmount = 0,
    totalCadenceCount = 0,
    maxBPM = 0,
    totalBPMAmount = 0,
    totalBPMCount = 0,
    maxSpeed = 0,
    totalSpeedAmount = 0,
    totalSpeedCount = 0;

  const lapCallback = lap => {
    totalActivitySeconds += lap.totalSeconds;
    totalActivityMeters += lap.totalMeters;
    totalActivityCalories += lap.calories;
  };

  const trackCallback = point => {
    const { cadence, BPM, speed } = point;

    if (cadence) {
      totalCadenceAmount += cadence;
      totalCadenceCount++;
      maxCadence = cadence > maxCadence ? cadence : maxCadence;
    }

    if (BPM) {
      totalBPMAmount += BPM;
      totalBPMCount++;
      maxBPM = BPM > maxBPM ? BPM : maxBPM;
    }

    if (speed) {
      totalSpeedAmount += speed;
      totalSpeedCount++;
      maxSpeed = speed > maxSpeed ? speed : maxSpeed;
    }

    totalActivityTrack.push(point);
  };

  const laps = data["Lap"].map(lap =>
    parseLap(lap, lapCallback, trackCallback)
  );

  let averageSpeed = totalSpeedAmount / totalSpeedCount;
  averageSpeed *= 2.23694;
  maxSpeed *= 2.23694;

  return {
    activity: {
      sport: data["@Sport"],
      startTime: parseDate(data.Id),
      totalActivitySeconds,
      totalActivityMeters,
      totalActivityCalories,
      maxSpeed: precisionRound(maxSpeed, 2),
      averageSpeed: precisionRound(averageSpeed, 2),
      maxCadence,
      averageCadence: Math.round(totalCadenceAmount / totalCadenceCount),
      maxBPM,
      averageBPM: Math.round(totalBPMAmount / totalBPMCount),
      totalActivityTrack,
      laps
    }
  };
}

export default function garmin(xml) {
  return parse(xml);
}
