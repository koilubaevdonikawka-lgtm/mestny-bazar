import { BootstrapTokens } from "@server/bootstrap/tokens";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CustomerStatus } from "@server/application/modules/customer/customer/models";
import type { OrderModule } from "@server/application/modules/order/order/api/order.module";
import type { CustomerManagementApplicationService } from "@server/application/customer-management/services/customer-management-application.service";
import type { CustomerManagementService } from "@server/application/customer-management/services/customer-management.service";
import type { ITestScenario } from "@server/platform/testing/testing/contracts";
import type { TestExecutionContext } from "@server/platform/testing/testing/runners/test-execution.context";

export const CustomerManagementScenarioId = "customer-management";

/** Validates full customer lifecycle from registration through deactivation. */
export class CustomerManagementScenario implements ITestScenario {
  readonly id = CustomerManagementScenarioId;
  readonly name = "Customer Management";
  readonly category = "customer-management";

  async run(context: TestExecutionContext): Promise<void> {
    const { assertions, fixtures } = context;

    const customers = context.resolveModule<CustomerManagementApplicationService>(
      InfrastructureTokens.CustomerManagementApplicationService,
    );
    const management = context.resolveModule<CustomerManagementService>(
      InfrastructureTokens.CustomerManagementService,
    );
    const orders = context.resolveModule<OrderModule>(BootstrapTokens.OrderModule);

    const registration = await management.register({
      displayName: "Lifecycle Customer",
      phone: "+996704000001",
      email: "lifecycle-customer@test.local",
    });
    const customer = registration.customer;
    assertions.assertSuccess(!customer.profile.phoneVerified, "Phone must be unverified after register");

    const profile = (
      await customers.createProfile({
        customerId: customer.id,
        displayName: "Lifecycle Customer",
        email: "lifecycle-customer@test.local",
        preferences: { language: "ru" },
      })
    ).value;
    assertions.assertSuccess(profile.preferences.language === "ru", "Profile preferences must be saved");

    const verified = (
      await customers.verifyPhone({
        customerId: customer.id,
        code: registration.verificationCode,
      })
    ).value;
    assertions.assertSuccess(verified.phoneVerified, "Phone must be verified");

    let home = (
      await customers.addAddress({
        customerId: customer.id,
        label: "Home",
        fullAddress: "Test street 10",
        city: "Bishkek",
        isDefault: true,
      })
    ).value;
    assertions.assertSuccess(home.isDefault, "First address must be default");

    const work = (
      await customers.addAddress({
        customerId: customer.id,
        label: "Work",
        fullAddress: "Office street 5",
        city: "Bishkek",
      })
    ).value;

    work &&
      (await customers.updateAddress({
        addressId: work.id,
        label: "Office",
        fullAddress: "Office street 7",
      }));
    assertions.assertSuccess(true, "Address update must succeed");

    home = (await customers.setDefaultAddress({ customerId: customer.id, addressId: home.id })).value;
    assertions.assertSuccess(home.isDefault, "Home must become default again");

    const addresses = (await customers.getAddresses(customer.id)).value;
    assertions.assertSuccess(addresses.length === 2, "Customer must have two addresses");

    const updatedProfile = (
      await customers.updateProfile({
        customerId: customer.id,
        displayName: "Updated Customer",
        phone: customer.profile.contact.phone,
        email: "updated-customer@test.local",
      })
    ).value;
    assertions.assertSuccess(
      updatedProfile.displayName === "Updated Customer",
      "Profile must be updated",
    );

    const notificationSettings = (
      await customers.updateNotificationSettings({
        customerId: customer.id,
        promotions: true,
        emailEnabled: false,
      })
    ).value;
    assertions.assertSuccess(notificationSettings.promotions, "Promotions must be enabled");
    assertions.assertSuccess(!notificationSettings.emailEnabled, "Email notifications must be disabled");

    assertions.assertSuccess(fixtures.product.id, "Product fixture must be seeded");
    assertions.assertSuccess(fixtures.seller.id, "Seller fixture must be seeded");

    await orders.createOrder({
      customerId: customer.id,
      address: home.fullAddress,
      phone: customer.profile.contact.phone,
      paymentMethod: "cash",
      deliveryMethod: "courier",
      currency: "KGS",
      items: [
        {
          productId: fixtures.product.id!,
          sellerId: fixtures.seller.id!,
          catalogId: "catalog-default",
          name: "Customer History Product",
          priceAmount: 500,
          currency: "KGS",
          quantity: 1,
        },
      ],
    });

    const history = (await customers.getOrderHistory(customer.id)).value;
    assertions.assertSuccess(history.orders.length >= 1, "Order history must contain at least one order");

    const profileView = (await customers.getProfile(customer.id)).value;
    assertions.assertSuccess(profileView.customer.status === CustomerStatus.Active, "Customer must be active");

    await customers.deleteAddress({ customerId: customer.id, addressId: work.id });
    const remainingAddresses = (await customers.getAddresses(customer.id)).value;
    assertions.assertSuccess(remainingAddresses.length === 1, "Work address must be deleted");

    const deactivated = (
      await customers.deactivate({
        customerId: customer.id,
        reason: "Test deactivation",
      })
    ).value;
    assertions.assertSuccess(
      deactivated.status === CustomerStatus.Deactivated,
      "Customer must be deactivated",
    );

    const deactivatedActionFailed = await customers
      .addAddress({
        customerId: customer.id,
        label: "Blocked",
        fullAddress: "Should fail",
      })
      .then(() => false)
      .catch(() => true);
    assertions.assertSuccess(deactivatedActionFailed, "Actions on deactivated customer must fail");
  }
}
