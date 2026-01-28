export const successResponse = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

export const createdResponse = (res, data) => {
  successResponse(res, data, 201);
};

export const noContentResponse = (res) => {
  res.status(204).send();
};

export const paginatedResponse = (res, data, pagination) => {
  res.status(200).json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
};
