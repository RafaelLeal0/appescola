import React from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { Colors } from '../../src/styles/Colors';

export default function SplashScreen() {
	return (
		<View style={styles.container}>
			<StatusBar backgroundColor={Colors ? Colors.primary : '#fff'} barStyle="light-content" />
			<Image
				source={require('../../assets/logo.png')}
				style={styles.logo}
				resizeMode="contain"
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors ? Colors.background : '#fff',
		justifyContent: 'center',
		alignItems: 'center',
	},
	logo: {
		width: 350,
		height: 350,
	},
});
