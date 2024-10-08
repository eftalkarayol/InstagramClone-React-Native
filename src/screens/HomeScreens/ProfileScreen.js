import {FlatList, StyleSheet, View} from 'react-native';
import React, {useContext, useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {Button} from 'react-native-paper';
import MyFastImage from '../../components/MyFastImage';
import {DataContext} from '../../context/context';
import firestore from '@react-native-firebase/firestore';
import {Text} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import InfoCart from '../../components/InfoCart';
import {colors} from '../../utils/colors';
import MyIcon from '../../components/MyIcon';
import auth from '@react-native-firebase/auth';
import MyButton from '../../components/MyButton';
import PressebleIcon from '../../components/PressebleIcon';
import SpecialButton from '../../components/SpecialButton';
import {values} from '../../utils/screenValue';
import LightButton from '../../components/LightButton';
import crashlytics from '@react-native-firebase/crashlytics';

const ProfileScreen = ({uid, route}) => {
  const {userInfo} = useContext(DataContext);
  const navigation = useNavigation();

  const [posts, setPosts] = useState([]);
  const [pUserInfo, setpUserInfo] = useState(userInfo);
  const [activeChanger, setActiveChanger] = useState(0);
  const [searchUid, setSearchUid] = useState(route?.params.uid.userID);
  const [bottomUid, setBottomUid] = useState(uid);
  const [isFollowing, setIsFollowing] = useState(false);
  const [targetUser, setTargetUser] = useState(route?.params.uid);

  const fetchPost = puid => {
    //subscriber değişkeni oluştrurak sürekli çalışmasını return ettiğinde engelliyor
    const subscriber =
      //Veri Tabanındaki Verilerimizin yolunu Belirttik Önce
      //Post=>userID=>UserPost====>bu koleksiyondaki dökümalarda olduğu post bilgileri burayı onSnapshot ile dinlemey aldık

      firestore()
        .collection('Post')
        .doc(puid)
        .collection('UserPost')

        //Herbir Post Bilgisine sahib document lerin olduğu collection u
        //onSnapshot metodu ile döndük.bu metod bize bir QuerySnap döndürür
        //Dönen QuerySnap bizim document lerimizdir
        //Daha sonra consoldan kontrol ederek documentlerdeki verilere eriştik

        .onSnapshot(QuerySnapshot => {
          let postArray = [];
          QuerySnapshot._docs.map(p => {
            //Alltaki console log document deki verileri getirir
            // console.log(p._data)

            // Bizim Gelen post bilgileri obje geliyor
            //Ancak Flatlistte data olarak liste olması gerekiyor
            //bizde gelen her bir objeyi postArray dizisine ekliyoruz
            postArray.push(p._data);
            //oluşturduğumuz listeyi posts statemize aktarıyoruz
            setPosts(postArray);
          });
        });

    // Stop listening for updates when no longer required
    return () => subscriber();
  };

  const fetchSearchUserInfo = async userid => {
    const user = await firestore().collection('Users').doc(userid).get();
    setpUserInfo(user._data);
    //console.log(user)
  };

  useEffect(() => {
    if (searchUid == userInfo?.userID) {
      fetchPost(userInfo?.userID);
      setpUserInfo(userInfo);
    } else if (bottomUid == userInfo?.userID) {
      fetchPost(userInfo?.userID);
      setpUserInfo(userInfo);
    } else {
      fetchPost(searchUid);
      fetchSearchUserInfo(searchUid);
    }
  }, [searchUid, bottomUid, isFollowing]);

  useEffect(() => {
    checkIfFollowing();
  }, []);

  const checkIfFollowing = async () => {
    try {
      const followerRef = firestore()
        .collection('Followers')
        .doc(userInfo?.userID)
        .collection('UserFollowers')
        .doc(targetUser?.userID);

      const snapshot = await followerRef.get();
      const isUserFollowing = snapshot.exists;
      setIsFollowing(isUserFollowing);
    } catch (error) {
      console.log(error);
    }
  };
  const toggleFollow = async () => {
    try {
      const followerRef = firestore()
        .collection('Followers')
        .doc(userInfo?.userID)
        .collection('UserFollowers')
        .doc(searchUid);

      const followingRef = firestore()
        .collection('Following')
        .doc(userInfo?.userID)
        .collection('UserFollowing')
        .doc(searchUid);

      const userRef = firestore().collection('Users').doc(userInfo?.userID);
      const targetUserRef = firestore().collection('Users').doc(searchUid);

      const batch = firestore().batch();

      if (isFollowing) {
        batch.delete(followerRef);
        batch.delete(followingRef);

        batch.update(userRef, {
          followingCount: firestore.FieldValue.increment(-1),
        });

        batch.update(targetUserRef, {
          followersCount: firestore.FieldValue.increment(-1),
        });

        setIsFollowing(false);
      } else {
        batch.set(followerRef, targetUser);
        batch.set(followingRef, userInfo);

        batch.update(userRef, {
          followingCount: firestore.FieldValue.increment(1),
        });

        batch.update(targetUserRef, {
          followersCount: firestore.FieldValue.increment(1),
        });

        setIsFollowing(true);
      }

      await batch.commit();
    } catch (error) {
      console.log(error);
    }
  };
  const triggerCrash = () => {
    crashlytics().log('Testing Crashlytics adsadsadasda');
    crashlytics().crash(); // Bu yöntem, test çökmesi oluşturur
    console.log('Çökme gerçekleşti');
  };
  // console.log(pUserInfo);
  // console.log('s', searchUid);
  // console.log('b', bottomUid);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.topContainer}>
        <View style={styles.headContainer}>
          <PressebleIcon name={'arrow-back-outline'} size={25} />
          <Text style={styles.name}>{pUserInfo?.name}</Text>
          <PressebleIcon
            onPress={() => auth().signOut()}
            name={'settings-outline'}
            size={25}
          />
        </View>

        <View style={styles.userBar}>
          <MyFastImage image={pUserInfo?.photo} style={styles.profilePhoto} />
          <View style={styles.rightSide}>
            <View style={styles.userItem}>
              <Text style={styles.name}>{pUserInfo?.postCount} </Text>
              <Text style={styles.type}>Post</Text>
            </View>

            <View style={styles.userItem}>
              <Text style={styles.name}>{pUserInfo?.followersCount}</Text>
              <Text style={styles.type}>Takipçi</Text>
            </View>

            <View style={styles.userItem}>
              <Text style={styles.name}>{pUserInfo?.followingCount}</Text>
              <Text style={styles.type}>Takip Edilen</Text>
            </View>
          </View>
        </View>

        <View style={styles.userInfoBar}>
          <Text style={styles.name}>{pUserInfo?.name}</Text>
          <Text>{pUserInfo?.bio}</Text>
          <Text>Takip edenler info barı</Text>
        </View>

        {uid !== pUserInfo?.userID && (
          <View style={styles.buttonBar}>
            <SpecialButton
              onPress={toggleFollow}
              label={isFollowing ? 'Takibi Bırak' : 'Takip Et'}
            />
            <LightButton label={'Mesaj'} />
            <PressebleIcon name={'person-add-outline'} size={25} />
          </View>
        )}

        <View style={styles.changerBar}>
          <PressebleIcon
            style={
              activeChanger == 0 ? styles.leftChangerActive : styles.changer
            }
            onPress={() => setActiveChanger(0)}
            name={'apps-outline'}
            size={30}
          />
          <PressebleIcon
            onPress={() => setActiveChanger(1)}
            style={
              activeChanger == 1 ? styles.rightChangerActive : styles.changer
            }
            name={'image-outline'}
            size={30}
          />
        </View>
      </View>

      {activeChanger == 0 ? (
        <View style={styles.bottomContainer}>
          <FlatList
            numColumns={3}
            horizontal={false}
            data={posts}
            renderItem={({item}) => {
              return (
                <View style={styles.imageContainer}>
                  <MyFastImage style={styles.image} image={item.postPhoto} />
                </View>
              );
            }}
          />
        </View>
      ) : (
        <View>
          <Text>2</Text>
        </View>
      )}

      <View style={styles.crashButtonContainer}>
        <SpecialButton onPress={triggerCrash} label="Crash Test" />
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  crashButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  mainContainer: {
    flex: 1,
  },
  topContainer: {},
  headContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 25,
    backgroundColor: 'white',
  },

  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  type: {
    color: 'gray',
  },

  userBar: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  rightSide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    gap: 30,
  },
  userInfoBar: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
  },

  buttonBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: 'white',
    gap: 18,
  },

  changerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'white',
  },

  bottomContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  col: {
    width: values.windowWidth / 3,
    height: values.windowWidth / 3,
    padding: 1,
  },

  imageContainer: {
    flex: 1 / 3,
  },

  image: {
    flex: 1,
    aspectRatio: 1 / 1,
  },

  profilePhoto: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderRadius: 50,
    borderColor: '#fb3958',
  },
  changer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftChangerActive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
  },
  rightChangerActive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
  },
});
