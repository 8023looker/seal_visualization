import {register as registerPlugins} from "./plugins/"
import {loadGeojson} from "./dataloader"
export { getTestData, augmentTrajectoryData, getGeoFeaturesWithStatistics, getAllOD, getCachedCircleAggregation, preCalcGeoInfo} from "./dataloader"

export async function initialize() {
  await registerPlugins();
  await loadGeojson();
}
