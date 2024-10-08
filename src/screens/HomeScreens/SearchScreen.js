import {StyleSheet, Text, View, TextInput} from 'react-native';
import React, {useState} from 'react';
import SearchBar from '../../components/SearchBar';
import PressebleText from '../../components/PressebleText';
import {colors} from '../../utils/colors';
import SearchCard from '../../components/SearchCard';
import PressebleIcon from '../../components/PressebleIcon';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState(null);
  const [resultAvaible, setResultAvaible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const navigation = useNavigation();
  const handleSearch = query => {
    setSearchQuery(query);

    firestore()
      .collection('Users')
      .where('name', '==', query)
      .get()
      .then(querySnapshot => {
        const users = [];
        querySnapshot.forEach(documentSnapshot => {
          // console.log(documentSnapshot.data());
          const user = documentSnapshot.data();
          users.push(user);
        });
        setSearchResults(users);
        if (searchResults == []) {
          setResultAvaible(false);
        } else {
          setResultAvaible(true);
        }
      });
  };

  return (
    <View>
      <View style={styles.searchContainer}>
        <View style={styles.mainContainer}>
          <PressebleIcon name={'search-outline'} size={15} />
          <TextInput
            value={searchQuery}
            onChangeText={text => handleSearch(text)}
            placeholder="Kullanıcı Adı"
          />
        </View>
        <PressebleText label={'İptal'} />
      </View>
      <View style={styles.content}>
        <Text style={styles.contentText}>Yakındakiler</Text>
        <PressebleText style={styles.contentPText} label={'Tümünü Gör'} />
      </View>

      {resultAvaible == false ? (
        <SearchCard
          uName={'Eftal Karayol'}
          uSName={'ekarayol'}
          pPhoto={
            'https://images.unsplash.com/photo-1714151676782-3d37e0847c25?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw1NHx8fGVufDB8fHx8fA%3D%3D'
          }
        />
      ) : (
        <SearchCard
          onPress={() =>
            navigation.navigate('ProfileScreen', {
              uid: searchResults[0],
            })
          }
          uName={searchResults[0]?.name}
          uSName={searchResults[0]?.name}
          pPhoto={searchResults[0]?.photo}
        />
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 15,
    borderBottomWidth: 0.2,
  },

  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'white',
  },
  contentText: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  contentPText: {
    color: '#405DE6',
    fontWeight: 'bold',
  },
  mainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: '#FAF3F0',
    padding: 20,
    borderRadius: 30,
    flex: 1,
  },
});
