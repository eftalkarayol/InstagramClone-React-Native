import {FlatList, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useContext, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {DataContext} from '../../context/context';
import PostCard from '../../components/PostCard';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../components/Header';
const Feed = () => {
  const {userInfo} = useContext(DataContext);
  const [posts, setPosts] = useState();

  const fetchPosts = async () => {
    try {
      const followingSnapShot = await firestore()
        .collection('Following')
        .doc(userInfo?.userID)
        .collection('UserFollowing')
        .get();

      const followedUsers = followingSnapShot.docs.map(doc => doc.id);
      const posts = [];
      for (const userId of followedUsers) {
        const snapshot = await firestore()
          .collection('Post')
          .doc(userId)
          .collection('UserPost')
          .get();
        snapshot.forEach(doc => {
          const post = doc.data();
          posts.push(post);
        });
      }

      setPosts(posts);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userInfo?.userID]);

  return (
    <SafeAreaView style={{flex: 1}}>
      <Header />
      <FlatList
        style={{flex: 1}}
        data={posts}
        renderItem={({item}) => <PostCard post={item} />}
      />
    </SafeAreaView>
  );
};

export default Feed;

const styles = StyleSheet.create({});
