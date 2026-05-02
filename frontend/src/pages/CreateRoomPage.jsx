import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useRoomStore from '../store/useRoomStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';

const createRoomSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  topic: z.string().min(10, 'Topic must be at least 10 characters'),
  description: z.string().optional(),
  isPrivate: z.boolean().optional(),
  maxParticipants: z.number().min(2).max(20).optional(),
});

const CreateRoomPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createRoomSchema),
  });
  const createRoom = useRoomStore((state) => state.createRoom);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const newRoom = await createRoom(data);
      navigate(`/rooms/${newRoom._id}`);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create a New Room</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <Input id="title" {...register('title')} />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Topic</label>
          <Input id="topic" {...register('topic')} />
          {errors.topic && <p className="text-red-500 text-sm mt-1">{errors.topic.message}</p>}
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <Input id="description" {...register('description')} />
        </div>
        <div className="flex items-center">
          <input id="isPrivate" type="checkbox" {...register('isPrivate')} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
          <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-900">Private Room</label>
        </div>
        <div>
          <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">Max Participants</label>
          <Input id="maxParticipants" type="number" defaultValue={10} {...register('maxParticipants', { valueAsNumber: true })} />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Room'}
        </Button>
      </form>
    </div>
  );
};

export default CreateRoomPage;