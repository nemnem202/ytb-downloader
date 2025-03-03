import { useEffect, useState } from "react";
import { TextField, Button, Typography, Container, Box } from "@mui/material";

export default function App() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const serverUrl = "https://server-ytb-downloader-production.up.railway.app";

  const [errorMessage, setError] = useState(null);

  const handleDownload = async (dataUrl) => {
    if (!dataUrl) return;
    try {
      const encodedUrl = encodeURIComponent(dataUrl); // Encoder l'URL entière
      const res = await fetch(`${serverUrl}/download?url=${encodedUrl}`);

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      } else {
        const data = await res.json();
        console.error("Erreur:", data.error);
      }
    } catch (error) {
      console.error("Erreur de téléchargement", error);
      setError("Url invalide !");
    }
    setLoading(false);
  };

  const fetchVideoInfo = async (url) => {
    const res = await fetch(`https://noembed.com/embed?url=${url}`);
    const data = await res.json();
    return {
      title: data.title,
      channel: data.author_name,
      thumbnail: data.thumbnail_url,
      url: data.url,
    };
  };

  const handleFetch = async (url) => {
    const data = await fetchVideoInfo(url);
    if (!data.title || !data.channel || !data.thumbnail) {
      setError("Invalid URL !");
      setLoading(false);
      return;
    }
    setVideoData(data);
    handleDownload(data.url);
  };

  useEffect(() => {
    if (downloadUrl) {
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = "video.mp4";
      downloadLink.click(); // Simule le clic pour lancer le téléchargement
    }
  }, [downloadUrl]);

  return (
    <>
      <Container>
        <Typography variant="h1" gutterBottom color="primary">
          Youtube video downloader
        </Typography>

        <Box sx={{ display: "flex", gap: "1%" }}>
          <TextField
            label="Enter YouTube URL"
            variant="outlined"
            fullWidth
            color="primary"
            onChange={(event) => setVideoUrl(event.target.value)}
            error={Boolean(errorMessage)}
            helperText={errorMessage}
            autoComplete="off"
          />

          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setLoading(true);
              handleFetch(videoUrl);
            }}
            loading={loading}
          >
            Download
          </Button>
        </Box>
        {videoData ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            overflow="hidden"
            boxShadow={3}
            width={300}
            style={{ borderRadius: "8px" }}
            margin={"auto"}
            marginTop={3}
          >
            <Box
              overflow="hidden"
              height={150}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <img
                src={videoData.thumbnail}
                alt="Video Thumbnail"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </Box>

            <Box padding={1}>
              {" "}
              <Typography variant="h6">{videoData.title}</Typography>
              <Typography variant="body2" color="textSecondary">
                {videoData.channel}
              </Typography>
            </Box>
          </Box>
        ) : (
          ""
        )}
      </Container>
    </>
  );
}
