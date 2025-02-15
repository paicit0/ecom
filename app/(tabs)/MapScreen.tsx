// MapScreen.tsx
import { View } from "react-native";
import MapView from "react-native-maps";
import { PROVIDER_GOOGLE } from "react-native-maps";

function MapScreen() {
  return (
    <View style={{}}>
      <MapView provider={PROVIDER_GOOGLE} style={{}} />
    </View>
  );
}

export default MapScreen;
