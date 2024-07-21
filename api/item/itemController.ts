import { PrismaClient, ItemStatus } from '@prisma/client';
import { existsSync, createReadStream } from 'fs-extra';
import { Request, Response } from 'express';
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  body: {
    userId: string;
    title: string;
    description: string;
    itemId?: string;
    status: ItemStatus;
  };
  //files?: Express.Multer.File[];
  //files?: MulterFile[] | { [fieldname: string]: MulterFile[] };
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}

const createItem = async (req: AuthRequest, res: Response): Promise<void> => {
  console.log("createItem_API welcome: ", req.body)
  const { userId, title, description } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    //console.log("user_API: ", user)
    console.log("files: ", req?.files)

     if (!req.files || req.files.length === 0) {
      console.log("No files uploaded")
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }
    const filePaths = (req.files as Express.Multer.File[]).map(file => file.path);
    console.log("filePaths: ", filePaths)
  
    const newItem = await prisma.item.create({
      data: {
        title,
        description,
        imageUri: filePaths,
        // imageUri: [''],
        status: ItemStatus.SIPARIS,
        time: new Date(),
        active: true,
      },
    });
    console.log("newItem: ", newItem)

    // Create an assignment for the user and the new item
    const newAssignment = await prisma.assignment.create({
      data: {
        userId: user.id,
        itemId: newItem.id,
        status: ItemStatus.SIPARIS,
        assignedAt: new Date(),
      },
    });
    console.log("newAssignment: ", newAssignment)

    res.status(201).json({ newItem, newAssignment });
  } catch (error) {
    console.log("hatamıedsz: ",error)
    res.status(400).json({ error });
  }
};

const getAllItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0; // Get skip value from query parameter, default to 0 if not provided
    const status = req.query.status || 'All';

    console.log('skip_limit ', skip)
    console.log('status_limit ', status)

    let whereCondition = {}; // Define where condition for filtering by status
    if (status !== 'ALL') {
      whereCondition = {
        status: status // Add status filter to where condition if status is provided and not 'All'
      };
    }
    console.log("whereCondition: ", whereCondition)

    const numItemsByStatus = await prisma.item.count({ where: whereCondition })

    await prisma.item.findMany({
      skip: skip,
      take: 10,
      where: whereCondition,
      include: {
        assignments: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }, 
          orderBy: { assignedAt: 'desc' }  // for status history of assignments
        }
      },
    })
      .then((items: any) => {
        console.log("items: ", items.length)

        const itemsWithFullHistory = items.map((item: any, index: any) => {
          console.log("item: ",index, " ", item.title)
          return {
            ...item,
            numItemsByStatus,
            latestStatus: item.status,
            statusHistory: item.assignments.map((assignment: any) => ({
                status: assignment.status,
                userName: assignment.user.name,
                assignedAt: assignment.assignedAt,
              }))
          }
        })
        
        res.status(200).json(itemsWithFullHistory);
        return items
      })
      .catch((err: any) => {
        console.log("hatamız: ",err)
        res.status(500).json({ error: 'Failed to fetch items000' });
      });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

const getCountsByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("getCountsByStatus_ WELCOME")
    // Use Prisma to group items by status and count the number of items in each group
    const counts = await prisma.item.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });
    console.log("countsSTATUS: ", counts)


    // Transform the result to a more readable format
    const result = counts.map((group: any) => ({
      status: group.status,
      count: group._count._all,
    }));

    console.log('countsSTATUS_RESULT: ', result)

    res.status(200).json(result);
  } catch (error) {
    console.error('Failed to fetch counts by status:', error);
    res.status(500).json({ error: 'Failed to fetch counts by status' });
  }
};

const getCountsByDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentDate = new Date();

    // Calculate start and end dates for each time range
    const todayStartDate = new Date(currentDate.setHours(0, 0, 0, 0));
    const todayEndDate = new Date(currentDate.setHours(23, 59, 59, 999));

    const yesterdayStartDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
    yesterdayStartDate.setHours(0, 0, 0, 0);
    const yesterdayEndDate = new Date(yesterdayStartDate);
    yesterdayEndDate.setHours(23, 59, 59, 999);

    const thisWeekStartDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
    thisWeekStartDate.setHours(0, 0, 0, 0);
    const thisWeekEndDate = new Date(currentDate.setDate(currentDate.getDate() + (6 - currentDate.getDay())));
    thisWeekEndDate.setHours(23, 59, 59, 999);

    const lastWeekStartDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() - 7));
    lastWeekStartDate.setHours(0, 0, 0, 0);
    const lastWeekEndDate = new Date(lastWeekStartDate);
    lastWeekEndDate.setDate(lastWeekStartDate.getDate() + 6);
    lastWeekEndDate.setHours(23, 59, 59, 999);

    const thisMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    thisMonthStartDate.setHours(0, 0, 0, 0);
    const thisMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    thisMonthEndDate.setHours(23, 59, 59, 999);

    const lastMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    lastMonthStartDate.setHours(0, 0, 0, 0);
    const lastMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    lastMonthEndDate.setHours(23, 59, 59, 999);

    // Aggregate pipeline for each time range
    const todayCount = await prisma.item.count({
      where: {
        time: { gte: todayStartDate, lte: todayEndDate }
      }
    });

    const yesterdayCount = await prisma.item.count({
      where: {
        time: { gte: yesterdayStartDate, lte: yesterdayEndDate }
      }
    });

    const thisWeekCount = await prisma.item.count({
      where: {
        time: { gte: thisWeekStartDate, lte: thisWeekEndDate }
      }
    });

    const lastWeekCount = await prisma.item.count({
      where: {
        time: { gte: lastWeekStartDate, lte: lastWeekEndDate }
      }
    });

    const thisMonthCount = await prisma.item.count({
      where: {
        time: { gte: thisMonthStartDate, lte: thisMonthEndDate }
      }
    });

    const lastMonthCount = await prisma.item.count({
      where: {
        time: { gte: lastMonthStartDate, lte: lastMonthEndDate }
      }
    });

    // Construct response object
    const countsByDate = {
      today: todayCount,
      yesterday: yesterdayCount,
      thisWeek: thisWeekCount,
      lastWeek: lastWeekCount,
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount
    };

    console.log("countsByDate: ", countsByDate);
    res.status(200).json(countsByDate);
  } catch (error) {
    console.error('Failed to fetch counts by date:', error);
    res.status(500).json({ error: 'Failed to fetch counts by date' });
  }
};

const updateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { itemId } = req.params
  const { userId, status } = req.body;
  console.log("updateStatus__API: ", itemId, userId, status);

  try {
    // Find the item to ensure it exists
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    // Update the item's status
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: { status },
    });

    // Create a new assignment record to track the status change
    const newAssignment = await prisma.assignment.create({
      data: {
        userId,
        itemId,
        status,
        assignedAt: new Date(), // Use the current date and time
      },
    });

    res.status(200).json({
      message: 'Item status updated successfully',
      updatedItem,
      newAssignment,
    });
  } catch (error) {
    console.error('Error updating item status:', error);
    res.status(500).json({ message: 'Error updating item status', error });
  }
};

const uploadPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  console.log('file', req.files);
  console.log('body', req.body);

  const { itemId } = req.body;
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }
    const filePaths = (req.files as Express.Multer.File[]).map(file => file.path);
    console.log("filePaths: ", filePaths)

    // Assuming you have a field `imageUris` in the `item` model which is an array of strings.
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: { imageUri: filePaths },
    });
    res.status(200).json({ message: 'success!', updatedItem });
  } catch (error) {
    console.error('Error saving file to DB:', error);
    res.status(500).json({ message: 'Error saving file to DB', error });
  }
};

const getImage = (req: Request, res: Response): void => {
  console.log("getImage: ", req.params)
  const imageName = req.params.imageName;
  const imagePath = `images/${imageName}`;
  
  try {
    if(imagePath && existsSync(imagePath)) {
      console.log("imagePath: ", imagePath)
      const fileStream = createReadStream(imagePath);
		  fileStream.pipe(res);
    } else {
      res.status(404).send('File not found');
    }
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).send('Error reading file');
  }
};

const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { itemId } = req.params;

    // Use Prisma to find all assignments related to the item
    const assignments = await prisma.assignment.findMany({
      where: {
        itemId: itemId,
      },
    });

    // Delete each assignment related to the item
    await Promise.all(
      assignments.map(async (assignment: any) => {
        await prisma.assignment.delete({
          where: {
            id: assignment.id,
          },
        });
      })
    );

    // Use Prisma to delete the item from the database
    await prisma.item.delete({
      where: {
        id: itemId,
      },
    });

    res.status(204).end(); // Respond with 204 No Content status if successful
  } catch (error) {
    console.error('Failed to delete item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};

export { createItem, getAllItems, getCountsByStatus, getCountsByDate, updateStatus, uploadPhoto, getImage, deleteItem };
