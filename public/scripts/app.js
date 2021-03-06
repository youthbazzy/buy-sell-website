// Client facing scripts here

let addToFavs = function(item_id) {
  alert('added item to favs');
  console.log(item_id);

  $.ajax({
    type: "POST",
    url: "/api/favourites/add",
    data: { item_id },
    datatype: "query",
  })

    // when receive response, re-render items list
    .done(function(responseData) {
      console.log('sent data');
    })
    // if error, log error
    .fail(function(errorData) {
      console.log("fail: ", errorData);
    });
};

$(document).ready(() => {

  // populate item card with item and maker info
  const addNewItem = function(item) {
    const $item = $(`
      <div class="layout">
      <img src="${item.item_photo_url}"/>
      <header class="maker-title">
        <div class="maker">
          <p id="maker">By: ${item.user_name}</p>
        </div>
        <div class="title">
          <h2>${item.title}</h2>
        </div>
      </header>
      <div class="description">
        <p>${item.description}</p>
      </div>
      <footer class="message-price">
        <div class="fav-button">
          <h2>
            <i onclick=addToFavs(${item.id}) class="fa-solid fa-heart"></i>
          </h2>
        </div>
        <div class="message">
          <a href="mailto:${item.email}?subject=Interested in your ${item.title
      } avatar">Message Seller</a>
        </div>
        <div class="price">
          <h2>$${item.price / 100}</h2>
        </div>
      </footer>
    `);

    if (item.sold_status == true) {
      $item.append("<h1>Sold Out!</h1>");
    }
    return $item;
  };

  //Function for My Items Page View//
  const myItems = function(item) {
    const $myItem = $(`
      <div class="layout">
      <img src="${item.item_photo_url}"/>
      <h2>${item.title}</h2>
      <span class="artist-price">
        <h2>$${item.price / 100}</h2>
      </span>
      <p>${item.description}</p>
      <div class="fav-button">
      <button class="sold" data-soldid = ${item.id}>Mark as Sold</button>
      <button class="delete" data-itemid = ${item.id}>Delete</button>
      </div>`);
    return $myItem;
  };

  // render all items on page
  const renderItems = function(itemJSON) {
    let itemsArr = itemJSON.items;
    $(".items-grid").empty();

    for (let item of itemsArr) {
      let $item = addNewItem(item);
      $(".items-grid").append($item);
      $(".items-grid").append($(`<div class="item-spacer"></div>`));
    }
  };

  // render admin's items on page
  const renderMyItems = function(itemJSON) {
    let itemsArr = itemJSON.items;
    $('.items-grid').empty();

    for (let item of itemsArr) {
      let $item = myItems(item);
      $('.items-grid').append($item);
      $('.items-grid').append($(`<div class="item-spacer"></div>`));
    }
  };

  // get items to render
  const loadItems = function() {
    $.ajax("/api/items/", { method: "GET" })
      .then(function(items) {
        renderItems(items);
      })
      .catch(function(err) {
        console.error(err);
      });
  };

  //show user's uploaded items
  const loadMyItems = function() {
    $.ajax("/api/myitems", { method: "GET" })
      .then(function(myItems) {
        renderMyItems(myItems);
      })
      .catch(function(err) {
        console.error(err);
      });
  };

  const loadFavItems = function() {
    $.ajax("/api/favourites/", { method: "GET" })
      .then(function(favItems) {
        renderItems(favItems);
      })
      .catch(function(err) {
        console.error(err);
      });
  };

  //loads re-rendered page when my items is clicked to show only user's items//
  $("#my_items").click(function(event) {
    loadMyItems();
  });

  //Hides/expands the filter field when selected//
  $("#item-filter-form").hide();

  $("#filter").on("click", () => {
    $("#item-filter-form").slideDown();
    return;
  });

  $(".cancel-filter").on("click", () => {
    $("#item-filter-form").slideUp();
    return;
  });

  // show favourite items for user
  $("#show_favourites").click(function(event) {
    loadFavItems();
  });

  // Even listener for price filter form submit button
  $("#item-filter-form").submit(function(event) {
    // prevent form from actually submitting
    event.preventDefault();

    // extract min and max prices from form
    let minPrice = $("#item-filter-form").find("#min-price").val();
    let maxPrice = $("#item-filter-form").find("#max-price").val();

    // form validation: if form isn't correct, alert error, else clear errors and submit
    if (minPrice < 0 || maxPrice < 0) {
      $("#submit-errors1").text("Price filters must be 0 or greater");
    } else {
      //clear errors
      $("#submit-errors1").text("");

      const data = $(this).serialize();

      // sent ajax request
      $.ajax({
        type: "POST",
        url: "/api/items/filter",
        data: data,
        datatype: "query",
      })

        // when receive response, re-render items list
        .done(function(responseData) {
          renderItems(responseData);
        })
        // if error, log error
        .fail(function(errorData) {
          console.log("fail: ", errorData);
        });
    }
  });

  //deletes item when delete button is clicked//
  $(document).on("click", ".delete", function(event) {
    const itemID = $(this).data("itemid");
    $.ajax({
      type: "POST",
      url: "/api/myitems/delete",
      data: { itemID },
      datatype: "query",
    })
      .then(() => {
        document.location = "/";
      });
  });

  //marks item as sold out when mark as sold button is clicked//
  $(document).on("click", ".sold", function(event) {
    const itemID = $(this).data("soldid");
    $.ajax({
      type: "POST",
      url: "/api/myitems/sold",
      data: { itemID },
      datatype: "query",
    })
      .then(() => {
        $(".sold").hide();
      });
  });

  loadItems();
  renderMyItems();
});
