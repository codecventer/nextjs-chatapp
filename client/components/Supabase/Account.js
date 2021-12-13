import { useEffect, useState } from "react";
import io from "socket.io-client";
import {
  Box,
  useColorModeValue,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { supabase } from "./SupabaseClient";
import UserAvatar from "./UserAvatar";
import Chat from "../Chat";

const socket = io.connect("http://localhost:3001");

export default function Account({ session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [website, setWebsite] = useState(null);
  const [avatar_url, setAvatarUrl] = useState(null);
  const toast = useToast();

  const joinRoom = () => {
    if (username !== "" || room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  const leaveChat = () => {
    setShowChat(false);
    setRoom("");
  };

  async function getProfile() {
    try {
      setLoading(true);
      const user = supabase.auth.user();

      const { data, error, status } = await supabase
        .from("profiles")
        .select("username, website, avatar_url")
        .eq("id", user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProfile();
  }, [session]);

  async function updateProfile({ username, website, avatar_url }) {
    try {
      setLoading(true);
      const user = supabase.auth.user();
      const updates = {
        id: user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates, {
        returning: "minimal",
      });

      if (error) {
        throw error;
      }
      toast({
        title: "Profile updated",
        position: "top",
        variant: "subtle",
        description: "",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Flex minH="48vh" align="center" justify="center">
        {!showChat ? (
          <Box
            maxW="445px"
            w="full"
            bg={useColorModeValue("white", "gray.900")}
            p={6}
            textAlign="center"
            justifyItems="center"
            justifyContent="center"
          >
            <UserAvatar
              url={avatar_url}
              onUpload={(url) => {
                setAvatarUrl(url);
                updateProfile({ username, website, avatar_url: url });
              }}
            />
            <Text fontSize="sm" fontWeight={500} color="gray.500" mb={4}>
              {session.user.email}
            </Text>
            <Stack spacing={4} p={4}>
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  value={username || ""}
                  size="lg"
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={username || "Username"}
                  color={useColorModeValue("gray.800", "gray.200")}
                  bg={useColorModeValue("gray.100", "gray.600")}
                  border={0}
                  _focus={{
                    bg: useColorModeValue("gray.200", "gray.800"),
                    outline: "none",
                  }}
                />
              </FormControl>
            </Stack>
            <Stack spacing={4} p={4}>
              <FormControl>
                <FormLabel>LinkedIn</FormLabel>
                <Input
                  type="text"
                  value={website || ""}
                  size="lg"
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder={website || "LinkedIn URL"}
                  color={useColorModeValue("gray.800", "gray.200")}
                  bg={useColorModeValue("gray.100", "gray.600")}
                  border={0}
                  _focus={{
                    bg: useColorModeValue("gray.200", "gray.800"),
                    outline: "none",
                  }}
                />
              </FormControl>
            </Stack>
            <Stack mt={8} direction="row" spacing={4}>
              <Button
                onClick={() => supabase.auth.signOut()}
                flex={1}
                fontSize="md"
                _focus={{
                  bg: "gray.200",
                }}
              >
                Logout
              </Button>
              <Button
                isLoading={loading}
                loadingText="Updating ..."
                onClick={() => updateProfile({ username, website, avatar_url })}
                flex={1}
                fontSize="md"
                bg="#0070f3"
                color="white"
                boxShadow="0 5px 20px 0px rgb(72 187 120 / 43%)"
                _hover={{
                  bg: "blue.500",
                }}
                _focus={{
                  bg: "green.500",
                }}
              >
                {loading || "Update"}
              </Button>
            </Stack>
            <Stack mt={12} spacing={2} style={{ marginBottom: "16px" }}>
              <Input
                size="lg"
                placeholder="Room ID"
                onChange={(event) => {
                  setRoom(event.target.value);
                }}
              />
            </Stack>
            <Button
              loadingText="Joining ..."
              flex={1}
              fontSize="md"
              bg="green.400"
              color="white"
              size="lg"
              boxShadow="0 5px 20px 0px rgb(72 187 120 / 43%)"
              _hover={{
                bg: "green.500",
              }}
              _focus={{
                bg: "green.500",
              }}
              onClick={joinRoom}
            >
              {loading || "Create/Join a Chat"}
            </Button>
          </Box>
        ) : (
          <Box>
            <Stack mt={12} spacing={2} style={{ marginBottom: "32px" }}>
              <Chat socket={socket} username={username} room={room} />
            </Stack>
            <Button
              loadingText="Leaving ..."
              flex={1}
              fontSize="md"
              bg="#0070f3"
              color="white"
              size="md"
              boxShadow="0 5px 20px 0px rgb(72 187 120 / 43%)"
              _hover={{
                bg: "blue.500",
              }}
              _focus={{
                bg: "green.500",
              }}
              onClick={leaveChat}
            >
              {loading || "Leave Chat"}
            </Button>
          </Box>
        )}
      </Flex>
    </div>
  );
}
