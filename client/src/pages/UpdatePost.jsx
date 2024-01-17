// Import necessary dependencies and components
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate, useParams } from 'react-router-dom';

// Component
export default function UpdatePost() {
  // State variables
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);

  // Other hooks
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const { postId } = useParams();

  // Fetch post data on component mount
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/post/getposts?postId=${postId}`);
        const data = await res.json();

        if (!res.ok) {
          console.log(data.message);
          setPublishError(data.message);
          return;
        }

        setPublishError(null);
        setFormData(data.posts[0]);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchPost();
  }, [postId]);

  // Handle image upload
  const handleUpdloadImage = async () => {
    try {
      if (!file) {
        setImageUploadError('Please select an image');
        return;
      }

      setImageUploadError(null);

      const storage = getStorage(app);
      const fileName = new Date().getTime() + '-' + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError('Image upload failed');
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData({ ...formData, image: downloadURL });
          });
        }
      );
    } catch (error) {
      setImageUploadError('Image upload failed');
      setImageUploadProgress(null);
      console.error(error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/post/updatepost/${formData._id}/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setPublishError(data.message);
        return;
      }

      setPublishError(null);
      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError('Something went wrong');
    }
  };

  // Handle embedding video
  const handleEmbedVideo = () => {
    const videoLink = prompt('Enter the video URL:');

    if (videoLink) {
      try {
        const embedUrl = getEmbedUrl(videoLink);

        if (embedUrl) {
          const updatedContent = `${formData.content || ''}\n<iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
          setFormData({ ...formData, content: updatedContent });
        } else {
          console.error('Unsupported video platform or invalid URL');
        }
      } catch (error) {
        console.error('Invalid video URL', error);
      }
    }
  };

  // Handle adding file link
  const handleAddFileLink = () => {
    const fileLink = prompt('Enter the file URL:');

    if (fileLink) {
      const updatedContent = `${formData.content || ''}\n<a href="${fileLink}" target="_blank" rel="noopener noreferrer" style="background-color: blue; color: white; padding: 16px 32px; text-decoration: none; display: inline-block; border-radius: 4px;">Download File</a>`;
      setFormData({ ...formData, content: updatedContent });
    }
  };

  // Function to get the embed URL for videos
  const getEmbedUrl = (videoLink) => {
    if (videoLink.includes('youtube.com')) {
      const videoId = new URL(videoLink).searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (videoLink.includes('vimeo.com')) {
      const videoId = videoLink.split('/').pop().split('&')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    return null;
  };

  // Return the JSX
  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Update post</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4 sm:flex-row justify-between'>
          <TextInput
            type='text'
            placeholder='Title'
            required
            id='title'
            className='flex-1'
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            value={formData.title}
          />
          <Select
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            value={formData.category}
          >
            <option value='uncategorized'>Select a category</option>
            <option value='movies'>Movies</option>
            <option value='news'>News</option>
            <option value='series'>Series</option>
            <option value='anime'>Anime</option>
            <option value='kdrama'>kdrama</option>
          </Select>
        </div>
        <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
          <FileInput
            type='file'
            accept='image/*'
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type='button'
            gradientDuoTone='purpleToBlue'
            size='sm'
            outline
            onClick={handleUpdloadImage}
            disabled={imageUploadProgress}
          >
            {imageUploadProgress ? (
              <div className='w-16 h-16'>
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress || 0}%`}
                />
              </div>
            ) : (
              'Upload Image'
            )}
          </Button>
        </div>
        {imageUploadError && <Alert color='failure'>{imageUploadError}</Alert>}
        {formData.image && (
          <img
            src={formData.image}
            alt='upload'
            className='w-full h-full object-cover'
          />
        )}
        <ReactQuill
          theme='snow'
          value={formData.content}
          placeholder='Write something...'
          className='h-72 mb-12'
          required
          onChange={(value) => setFormData({ ...formData, content: value })}
        />
        <Button
          type='button'
          gradientDuoTone='purpleToBlue'
          size='sm'
          onClick={handleEmbedVideo}
        >
          Embed Video
        </Button>
        <Button
          type='button'
          gradientDuoTone='purpleToBlue'
          size='sm'
          onClick={handleAddFileLink}
        >
          Add File Link
        </Button>
        <Button type='submit' gradientDuoTone='purpleToBlue'>
          Update post
        </Button>
        {publishError && (
          <Alert className='mt-5' color='failure'>
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}
