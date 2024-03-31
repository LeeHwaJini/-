import { useContext, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Color, Typography } from '../../styles';
import { EumcText } from '../../components';
import { BottomTwoBtn } from '../../components/Buttons';
import { RadioButton, SimpleInput } from '../../components/Inputs';

import { useInterval } from '../../utils';
import { CONFIRM_VALIDATION_NUMBER_SENT, PROMPT_DELETE_PAYMENT_CARD } from '../../popup-templates';
import { UserContext } from '../../context';

const windowWidth = Dimensions.get('window').width;
const childWidth = (windowWidth - 42) / 2;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.homeColor.primaryWhite,
  },
  contentWrap: {
    paddingHorizontal: 17,
  },
  contentTitle: {
    marginTop: 12,
    marginBottom: 4,
    color: Color.myPageColor.darkGray,
    ...Typography.smallBold,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  columnContainer: {
    flexDirection: 'column',
    alignContent: 'space-between',
    flexWrap: 'wrap',
    height: 100,
    width: '100%',
  },
  inputAlignLayout: {
    width: '69%',
  },
  btn: {
    flex: 1,
    height: 41,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  btnHalf: {
    maxWidth: childWidth,
    minWidth: 160,
  },
  btnBorder: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 4,
  },
  btnBorderGreen: {
    borderColor: Color.homeColor.primaryTurquoise,
    marginLeft: 8,
  },
  btnBorderGreenText: {
    color: Color.homeColor.primaryTurquoise,
  },
  btnBorderGray: {
    borderColor: Color.myPageColor.gray,
    color: Color.inputColor.black,
  },
  btnDarkGreen: {
    backgroundColor: Color.homeColor.primaryDarkgreen2,
  },
  btnDarkGreenText: {
    color: Color.homeColor.primaryWhite,
  },
  //Modal
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: -0.45,
  },
  infoText: {
    marginTop: 16,
    paddingHorizontal: 3,
    color: Color.homeColor.primaryDarkPurple,
    lineHeight: 28,
    //letterSpacing: -0.59,
  },
  ...Typography,
});

const SquareSwitchBtn = ({ title, checked, onPress, style, titleStyle }) => {
  if (checked === true) {
    style = [styles.btnDarkGreen, styles.btnHalf];
    titleStyle = styles.btnDarkGreenText;
  } else if (checked === false) {
    style = [styles.btnBorder, styles.btnBorderGray, styles.btnHalf];
    titleStyle = styles.btnBorderGray;
  }
  return (
    <TouchableOpacity style={[styles.btn, style]} activeOpacity={0.4} onPress={onPress}>
      <EumcText style={[titleStyle, styles.small]}>{title}</EumcText>
    </TouchableOpacity>
  );
};

const PaymentCardReg = ({ navigation }) => {
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [selectGender, setSelectGender] = useState('male');
  const [selectNation, setSelectNation] = useState('local');
  const [selectTelecom, setSelectTelecom] = useState('SKT');
  const telecomGroup = ['SKT', 'SKM', 'KT', 'KTM', 'LGT', 'LGM'];
  const [countSecond, setCountSecond] = useState(180); //카운트 초 지정
  const [isRunning, setIsRunning] = useState(false);
  const { setToast } = useContext(UserContext);

  const validateCardInfo = () => {
    const userData = {
      selectGender,
      selectNation,
      selectTelecom,
      name,
      birth,
    };
    for (key of Object.keys(userData)) {
      if (!userData[key]) {
        switch (key) {
          case 'name':
            setToast(ERROR_GENERIC_MISSING_VALUE('이름'));
            break;
          case 'birth':
            setToast(ERROR_GENERIC_MISSING_VALUE('생년월일'));
            break;
        }
        return false;
      }
    }
    return true;
  };

  useInterval(
    () => {
      setCountSecond(countSecond - 1);
    },
    isRunning && countSecond > 0 ? 1000 : null
  );

  return (
    <View style={styles.container}>
      {/* contentwrap */}
      <ScrollView contentContainerStyle={styles.contentWrap} keyboardDismissMode="interactive">
        <KeyboardAvoidingView behavior="padding">
          <EumcText style={styles.contentTitle}>이름</EumcText>
          <SimpleInput placeHolder="홍길동" type="text" setValue={setName} />
          <EumcText style={styles.contentTitle}>생년월일</EumcText>
          <SimpleInput placeHolder="19920911 (8자리)" type="numeric" maxLength={8} setValue={setBirth} />
          <EumcText style={styles.contentTitle}>성별</EumcText>
          <View style={styles.rowContainer}>
            <SquareSwitchBtn title="남자" checked={'male' === selectGender} onPress={() => setSelectGender('male')} />
            <SquareSwitchBtn
              title="여자"
              checked={'female' === selectGender}
              onPress={() => setSelectGender('female')}
            />
          </View>
          <EumcText style={styles.contentTitle}>국적</EumcText>
          <View style={styles.rowContainer}>
            <SquareSwitchBtn
              title="내국인"
              checked={'local' === selectNation}
              onPress={() => setSelectNation('local')}
            />
            <SquareSwitchBtn
              title="외국인"
              checked={'foreign' === selectNation}
              onPress={() => setSelectNation('foreign')}
            />
          </View>
          <EumcText style={styles.contentTitle}>이동통신사</EumcText>
          <View style={styles.columnContainer}>
            {telecomGroup &&
              telecomGroup.map((item, index) => (
                <RadioButton
                  key={index}
                  label={item}
                  checked={item === selectTelecom}
                  onPress={() => setSelectTelecom(item)}
                />
              ))}
          </View>
          <EumcText style={styles.contentTitle}>인증번호</EumcText>
          <View style={styles.rowContainer}>
            <View style={styles.inputAlignLayout}>
              <SimpleInput type="numeric" maxLength={11} />
            </View>
            <SquareSwitchBtn
              title="인증번호받기"
              style={[styles.btnBorder, styles.btnBorderGreen]}
              titleStyle={[styles.btnBorderGreenText, styles.small]}
              onPress={() =>
                setToast(Object.assign(CONFIRM_VALIDATION_NUMBER_SENT, { onConfirm: () => setIsRunning(true) }))
              }
            />
          </View>
          {isRunning === true && (
            <>
              <View style={styles.rowContainer}>
                <View style={styles.inputAlignLayout}>
                  <SimpleInput
                    placeHolder="185152"
                    type="numeric"
                    countText={`${Math.floor(countSecond / 60)}분 ${countSecond % 60}초`}
                  />
                </View>
                <SquareSwitchBtn
                  title="입력시간연장"
                  style={[styles.btnBorder, styles.btnBorderGreen]}
                  titleStyle={[styles.btnBorderGreenText, styles.small]}
                />
              </View>
              <EumcText style={[styles.small, styles.infoText]}>※본인 명의의 휴대폰만 인증 가능합니다.</EumcText>
            </>
          )}
        </KeyboardAvoidingView>
      </ScrollView>
      {/* contentwrap end */}
      {/* Floating */}
      <BottomTwoBtn
        leftTitle="취소"
        onCancel={() =>
          setToast(
            Object.assign(PROMPT_DELETE_PAYMENT_CARD, { redirect: () => navigation.navigate('PaymentCardMain') })
          )
        }
        rightTitle="다음"
        onNext={() => validateCardInfo() && navigation.navigate('PaymentCardInfoAdd')}
      />
    </View>
  );
};
export default PaymentCardReg;
