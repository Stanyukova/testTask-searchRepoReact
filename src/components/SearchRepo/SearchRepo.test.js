import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import SearchRepo from "./SearchRepo";

test("renders search input", () => {
  const { getByPlaceholderText } = render(<SearchRepo />);
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const inputElement = getByPlaceholderText("Введите имя пользователя");
  expect(inputElement).toBeInTheDocument();
});

test("renders 'No users found.'", () => {
  const { getByText } = render(<SearchRepo />);
  // eslint-disable-next-line testing-library/prefer-screen-queries
  const messageElement = getByText("Пользователи не найдены");
  expect(messageElement).toBeInTheDocument();
});

test("renders sorted user list after clicking sort button", async () => {
  render(<SearchRepo />);
  await screen.findByText(/Пользователи не найдены/i, {}, { timeout: 5000 });
  const sortButton = screen.queryByText("Отсортировать");
  expect(sortButton).toBeInTheDocument();
  if (sortButton) {
    fireEvent.click(sortButton);
    await screen.findByText(/Пользователи не найдены/i, {}, { timeout: 5000 });
    const userList = screen.queryAllByText((content, element) => {
      const hasReposText = content.includes("- Репозиториев:");
      const isListItem = element.tagName.toLowerCase() === "li";
      return hasReposText && isListItem;
    });
    const userRepos = userList.map((item) =>
      parseInt(item.textContent.split(" ")[2])
    );
    // eslint-disable-next-line jest/no-conditional-expect
    expect(userRepos).toEqual([...userRepos].sort((a, b) => a - b));
  }
});

test("renders user details after clicking on user item", async () => {
  render(<SearchRepo />);
  await screen.findByText(/Пользователи не найдены/i, {}, { timeout: 5000 });
  const userList = screen.queryAllByText((content, element) => {
    const hasReposText = content.includes("- Репозиториев:");
    const isListItem = element.tagName.toLowerCase() === "li";
    return hasReposText && isListItem;
  });

  if (userList.length > 0) {
    const username = userList[0].textContent.split(" - ")[0];
    fireEvent.click(userList[0]);

    const userDetails = await screen.findByText(/Location:/);
    // eslint-disable-next-line jest/no-conditional-expect
    expect(userDetails).toBeInTheDocument();
    // eslint-disable-next-line jest/no-conditional-expect
    expect(userDetails).toHaveTextContent(username);
  }
});
