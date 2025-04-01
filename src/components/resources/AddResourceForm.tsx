
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const resourceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  url: z.string().url("Please enter a valid URL"),
  type: z.enum(["article", "video", "book", "course", "tutorial"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  tags: z.string().optional(),
  author: z.string().optional(),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

interface AddResourceFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddResourceForm = ({ open, onClose, onSuccess }: AddResourceFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      description: "",
      url: "",
      type: "article",
      difficulty: "intermediate",
      tags: "",
      author: "",
    },
  });

  const onSubmit = async (data: ResourceFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convert comma-separated tags to array
      const tagsArray = data.tags ? data.tags.split(",").map(tag => tag.trim()) : [];
      
      // Invoke Supabase edge function to add resource
      const { error } = await supabase.functions.invoke("add-resource", {
        method: "POST",
        body: {
          ...data,
          tags: tagsArray,
          rating: 0,
          date_published: new Date().toISOString(),
        },
      });
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "Success",
        description: "Resource has been added successfully!",
      });
      
      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add resource",
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl dark:text-white">Add New Resource</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Share knowledge with the community by adding a valuable resource.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-300">Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Resource title" 
                      disabled={isSubmitting} 
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-300">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of the resource" 
                      disabled={isSubmitting}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-300">URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com" 
                      disabled={isSubmitting}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-300">Type</FormLabel>
                    <Select 
                      disabled={isSubmitting} 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="book">Book</SelectItem>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-300">Difficulty</FormLabel>
                    <Select 
                      disabled={isSubmitting} 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-300">Tags (comma-separated)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="javascript, frontend, web" 
                      disabled={isSubmitting}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-300">Author (optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Author name" 
                      disabled={isSubmitting}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="dark:bg-gray-700 dark:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Add Resource"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
