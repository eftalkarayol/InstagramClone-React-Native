import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import MyIcon from './MyIcon';
import {colors} from '../utils/colors';

const MyButton = ({title, onPress, iconName, iconColor, style}) => {
  return (
    <TouchableOpacity style={[styles.btnContainer, style]} onPress={onPress}>
      <MyIcon name={iconName} size={30} color={iconColor} />
      <Text style={styles.btnTitle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default MyButton;

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    maxWidth: 150,
    backgroundColor: colors.secondaryColor,
    borderRadius: 18,
    padding: 10,
    gap: 5,
  },
  btnTitle: {
    color: colors.textColor,
    fontSize: 18,
    fontWeight: 500,
  },
});
