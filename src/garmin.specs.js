import garmin, { parseDate } from "./garmin";
import fs from "fs";
import path from "path";

describe("Garmin", () => {
  let data, result;
  beforeAll(() => {
    data = fs.readFileSync(
      path.resolve(__dirname, "activity_2637228994.tcx"),
      "utf8"
    );

    result = garmin(data);
  });

  it("should be a function", () => {
    expect(typeof garmin).toEqual("function");
  });

  it("should return an activity", () => {
    expect(result).toHaveProperty("activity");
  });

  describe("Parsing", () => {
    describe("Dates in MST", () => {
      let input, result;

      beforeEach(() => {
        input = "2018-04-20T00:50:43.000Z";
        result = parseDate(input);
      });

      it("should parse the garmin date format", () => {
        expect(result.format("LLL")).toEqual("April 19, 2018 6:50 PM");
      });
    });
  });

  describe("Activity", () => {
    let activity;

    beforeAll(() => {
      activity = result.activity;
    });

    it("should have a sport", () => {
      expect(activity).toHaveProperty("sport");
    });

    it("should have a start time", () => {
      expect(activity).toHaveProperty("startTime");
    });

    it("should have a total activity time in seconds", () => {
      expect(activity).toHaveProperty("totalActivitySeconds");
    });

    it("should have a total activity calories", () => {
      expect(activity).toHaveProperty("totalActivityCalories");
    });

    it("should have a total activity distance in meters", () => {
      expect(activity).toHaveProperty("totalActivityMeters");
    });

    it("should have laps", () => {
      expect(activity).toHaveProperty("laps");
      expect(activity.laps.length).toBeGreaterThanOrEqual(1);
    });

    it("should have a total track", () => {
      expect(activity).toHaveProperty("totalActivityTrack");
      expect(activity.totalActivityTrack.length).toBeGreaterThanOrEqual(1);
    });

    it("should have an average BPM", () => {
      expect(activity).toHaveProperty("averageBPM");
    });

    it("should have a max BPM", () => {
      expect(activity).toHaveProperty("maxBPM");
    });

    it("should have an average cadence", () => {
      expect(activity).toHaveProperty("averageCadence");
    });

    it("should have a max cadence", () => {
      expect(activity).toHaveProperty("maxCadence");
    });

    it("should have an average speed", () => {
      expect(activity).toHaveProperty("averageSpeed");
    });

    it("should have a max speed", () => {
      expect(activity).toHaveProperty("maxSpeed");
    });

    describe("Lap", () => {
      let lap;

      beforeAll(() => {
        lap = activity.laps[0];
      });

      it("should have a start time", () => {
        expect(lap).toHaveProperty("startTime");
      });

      it("should have a total time in seconds", () => {
        expect(lap).toHaveProperty("totalSeconds");
      });

      it("should have a total distance in meters", () => {
        expect(lap).toHaveProperty("totalMeters");
      });

      it("should have a max speed", () => {
        expect(lap).toHaveProperty("maxSpeed");
      });

      it("should have a cadence", () => {
        expect(lap).toHaveProperty("cadence");
      });

      it("should have calories", () => {
        expect(lap).toHaveProperty("calories");
      });

      it("should have an average BPM", () => {
        expect(lap).toHaveProperty("averageBPM");
      });

      it("should have a maximum BPM", () => {
        expect(lap).toHaveProperty("maxBPM");
      });

      it("should have a track", () => {
        expect(lap).toHaveProperty("track");
      });

      it("should have a track length", () => {
        expect(lap.track.length).toBeGreaterThanOrEqual(1);
      });
    });

    describe("Track Point", () => {
      let trackPoint;

      beforeAll(() => {
        trackPoint = activity.totalActivityTrack[0];
      });

      it("should have a time", () => {
        expect(trackPoint).toHaveProperty("time");
      });

      it("should have an altitude in meters", () => {
        expect(trackPoint).toHaveProperty("altitudeMeters");
      });

      it("should have a distance in meters", () => {
        expect(trackPoint).toHaveProperty("distanceMeters");
      });

      it("should have a BPM", () => {
        expect(trackPoint).toHaveProperty("BPM");
      });

      it("should have a cadence", () => {
        expect(trackPoint).toHaveProperty("cadence");
      });

      it("should have a speed", () => {
        expect(trackPoint).toHaveProperty("speed");
      });

      it("should have a position", () => {
        expect(trackPoint).toHaveProperty("position");
      });

      describe("Position", () => {
        let position;

        beforeAll(() => {
          position = trackPoint.position;
        });

        it("should have a latitude", () => {
          expect(position).toHaveProperty("latitude");
        });

        it("should have a longitude", () => {
          expect(position).toHaveProperty("longitude");
        });
      });
    });
  });
});
